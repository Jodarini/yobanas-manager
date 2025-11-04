import { serverSupabaseClient } from '#supabase/server';
import { eq, inArray, sql } from 'drizzle-orm';
import {
  checkoutPayloadSchema,
  productsTable,
  productVariants,
  saleItems,
  sales,
} from '~~/db/schema';
import { useAuthDB } from '~~/server/utils/db';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  try {
    const body = await readBody(event);
    const product = checkoutPayloadSchema.parse(body);
    const items = product.items;


    return await useAuthDB(user, async (tx) => {
      // 1) Load variants and ensure tenant ownership via join to product/user
      const variantIds = items.map((i) => i.variantId)
      const variants = await tx
        .select({
          id: productVariants.id,
          productId: productVariants.productId,
          stock: productVariants.stock,
          // capture unit price from products table list price (or add variant price if you have it)
          unitPrice: productsTable.price,
        })
        .from(productVariants)
        .where(inArray(productVariants.id, variantIds))
        .leftJoin(productsTable, eq(productsTable.id, productVariants.productId))

      // Simple ownership check: every variant’s product must belong to user
      const allOwned = variants.every((v) => !!v && (v as any).products?.user_id === user.id)
      if (!allOwned || variants.length !== items.length) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden or invalid variant' })
      }

      // 2) Validate stock and prepare line rows
      const now = new Date()
      const lines = items.map((i) => {
        const v = variants.find((vv) => vv.id === i.variantId)!
        if (i.quantity <= 0) {
          throw createError({ statusCode: 400, statusMessage: 'Invalid quantity' })
        }
        if ((v.stock ?? 0) < i.quantity) {
          throw createError({ statusCode: 409, statusMessage: 'Insufficient stock' })
        }
        // numeric(12,2) expects strings or numbers, Drizzle will serialize
        const unit = v.unitPrice
        const lineTotal = Number(unit) * i.quantity
        return {
          user_id: user.id,
          product_variant_id: i.variantId,
          quantity: i.quantity,
          unit_price: unit,           // numeric(12,2)
          line_total: lineTotal,      // numeric(12,2)
          created_at: now,
        }
      })

      // 3) Create sale header with provisional total 0
      const [sale] = await tx
        .insert(sales)
        .values({
          user_id: user.id,
          status: 'paid',
          total_amount: '0',
          note: product.note ?? null,
          created_at: now,
        })
        .returning({ id: sales.id })

      // 4) Insert sale items (attach sale_id)
      await tx.insert(saleItems).values(lines.map((l) => ({ ...l, sale_id: sale.id })))

      // 5) Update inventory and counters per variant
      for (const l of lines) {
        await tx
          .update(productVariants)
          .set({
            stock: sql`${productVariants.stock} - ${l.quantity}`,
            sold_count: sql`${productVariants.sold_count} + ${l.quantity}`,
            last_sold_at: now,
          })
          .where(eq(productVariants.id, l.product_variant_id))
      }

      // 6) Compute total from lines and update sale header
      const total = lines.reduce((acc, l) => acc + Number(l.line_total), 0)
      await tx
        .update(sales)
        .set({ total_amount: total })
        .where(eq(sales.id, sale.id))

      return { saleId: sale.id, total }
    })


  } catch (err) {
    console.error('Error parsing the body', err);
    throw err;
  }
});
