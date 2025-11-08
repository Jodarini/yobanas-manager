import { serverSupabaseClient } from '#supabase/server';

import {
  checkoutPayloadSchema,
  sales,
  saleItems,
  productVariants,
  productsTable,
} from '~~/db/schema';
import { useAuthDB } from '~~/server/utils/db';
import { eq, inArray, sql } from 'drizzle-orm';

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
    const payload = checkoutPayloadSchema.parse(body);
    const items = payload.items;

    // Validate empty cart
    if (!items || items.length === 0) {
      throw createError({ statusCode: 400, message: 'Carrito vacío' });
    }

    return await useAuthDB(user, async (tx) => {
      const now = new Date();

      // 1) Load variants with product prices; RLS will auto-filter to user's products
      const variantIds = items.map((i) => i.variantId);
      const variants = await tx
        .select({
          id: productVariants.id,
          productId: productVariants.productId,
          stock: productVariants.stock,
          unitPrice: productsTable.price,
        })
        .from(productVariants)
        .innerJoin(
          productsTable,
          eq(productsTable.id, productVariants.productId)
        )
        .where(inArray(productVariants.id, variantIds));

      // Validate all variants exist
      if (variants.length !== items.length) {
        throw createError({
          statusCode: 404,
          message: 'Una o más variantes no existen',
        });
      }

      // 2) Validate stock and prepare line rows
      const variantMap = new Map(variants.map((v) => [v.id, v]));
      const lines: Array<{
        variantId: number;
        quantity: number;
        unitPrice: string | number;
        lineTotal: number;
      }> = [];

      for (const item of items) {
        if (item.quantity <= 0) {
          throw createError({ statusCode: 400, message: 'Cantidad inválida' });
        }

        const variant = variantMap.get(item.variantId);
        if (!variant) {
          throw createError({
            statusCode: 404,
            message: `Variante ${item.variantId} no encontrada`,
          });
        }

        const availableStock = variant.stock ?? 0;
        if (availableStock < item.quantity) {
          throw createError({
            statusCode: 409,
            message: `Stock insuficiente para ${item.variantId}. Disponible: ${availableStock}`,
          });
        }

        const unitPrice = variant.unitPrice;
        const lineTotal = Number(unitPrice) * item.quantity;

        lines.push({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice,
          lineTotal,
        });
      }

      // 3) Create sale header with provisional total 0
      const [sale] = await tx
        .insert(sales)
        .values({
          user_id: user.id,
          status: 'paid',
          note: payload.note ?? null,
          created_at: now,
        })
        .returning({ id: sales.id });

      if (!sale) {
        throw createError({
          statusCode: 500,
          message: 'Error al crear la venta',
        });
      }

      // 4) Insert sale items (attach sale_id)
      const saleItemsToInsert = lines.map((l) => ({
        user_id: user.id,
        sale_id: sale.id,
        product_variant_id: l.variantId,
        quantity: l.quantity,
        unit_price: l.unitPrice,
        line_total: l.lineTotal,
        created_at: now,
      }));

      await tx.insert(saleItems).values(saleItemsToInsert);

      // 5) Update inventory and counters per variant
      for (const line of lines) {
        await tx
          .update(productVariants)
          .set({
            stock: sql`${productVariants.stock} - ${line.quantity}`,
            sold_count: sql`${productVariants.sold_count} + ${line.quantity}`,
            last_sold_at: now,
          })
          .where(eq(productVariants.id, line.variantId));
      }

      // 6) Compute total and update sale header
      const total = lines.reduce((acc, l) => acc + l.lineTotal, 0);
      await tx
        .update(sales)
        .set({ total_amount: total.toString() })
        .where(eq(sales.id, sale.id));

      return {
        saleId: sale.id,
        total: total.toFixed(2),
        itemCount: items.length,
      };
    });
  } catch (err) {
    console.error('Error processing checkout:', err);

    // Check if it's a known error we threw
    if (err.statusCode) {
      throw err;
    }

    // Validation errors
    if (err.name === 'ZodError') {
      throw createError({ statusCode: 400, message: 'Payload inválido' });
    }

    throw createError({
      statusCode: 500,
      message: 'Error al procesar la venta. Intenta de nuevo.',
    });
  }
});
