import { serverSupabaseClient } from '#supabase/server';

import {
  checkoutPayloadSchema,
  sales,
  saleItems,
  productVariants,
  productsTable,
} from '~~/db/schema';
import { useAuthDB } from '~~/server/utils/db';
import { eq, inArray, sql, or } from 'drizzle-orm';

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

      // Separate items by type
      const variantItems = items.filter((i) => i.variantId);
      const productItems = items.filter((i) => i.productId);

      // 1) Load variants with product prices (for items with variants)
      let variants = [];
      if (variantItems.length > 0) {
        const variantIds = variantItems.map((i) => i.variantId!);
        variants = await tx
          .select({
            id: productVariants.id,
            productId: productVariants.productId,
            stock: productVariants.stock,
            unitPrice: productsTable.price,
            type: sql<'variant'>`'variant'`.as('type'),
          })
          .from(productVariants)
          .innerJoin(
            productsTable,
            eq(productsTable.id, productVariants.productId)
          )
          .where(inArray(productVariants.id, variantIds));

        if (variants.length !== variantItems.length) {
          throw createError({
            statusCode: 404,
            message: 'Una o más variantes no existen',
          });
        }
      }

      // 2) Load products without variants
      let products = [];
      if (productItems.length > 0) {
        const productIds = productItems.map((i) => i.productId!);
        products = await tx
          .select({
            id: productsTable.id,
            stock: productsTable.stock,
            unitPrice: productsTable.price,
            type: sql<'product'>`'product'`.as('type'),
          })
          .from(productsTable)
          .where(inArray(productsTable.id, productIds));

        if (products.length !== productItems.length) {
          throw createError({
            statusCode: 404,
            message: 'Uno o más productos no existen',
          });
        }
      }

      // 3) Create unified map and validate stock
      const itemMap = new Map();

      // Add variants to map
      for (const v of variants) {
        itemMap.set(`variant-${v.id}`, v);
      }

      // Add products to map
      for (const p of products) {
        itemMap.set(`product-${p.id}`, p);
      }

      const lines: Array<{
        variantId?: number;
        productId?: number;
        quantity: number;
        unitPrice: string | number;
        lineTotal: number;
      }> = [];

      for (const item of items) {
        if (item.quantity <= 0) {
          throw createError({ statusCode: 400, message: 'Cantidad inválida' });
        }

        let itemData;
        let itemKey;

        if (item.variantId) {
          itemKey = `variant-${item.variantId}`;
          itemData = itemMap.get(itemKey);
        } else if (item.productId) {
          itemKey = `product-${item.productId}`;
          itemData = itemMap.get(itemKey);
        }

        if (!itemData) {
          throw createError({
            statusCode: 404,
            message: `Artículo no encontrado`,
          });
        }

        const availableStock = itemData.stock ?? 0;
        if (availableStock < item.quantity) {
          throw createError({
            statusCode: 409,
            message: `Stock insuficiente. Disponible: ${availableStock}`,
          });
        }

        const unitPrice = itemData.unitPrice;
        const lineTotal = Number(unitPrice) * item.quantity;

        lines.push({
          variantId: item.variantId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          lineTotal,
        });
      }

      // 4) Create sale header
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

      // 5) Insert sale items
      const saleItemsToInsert = lines.map((l) => ({
        user_id: user.id,
        sale_id: sale.id,
        product_variant_id: l.variantId ?? null,
        product_id: l.productId ?? null, // You'll need to add this column
        quantity: l.quantity,
        unit_price: l.unitPrice,
        line_total: l.lineTotal,
        created_at: now,
      }));

      await tx.insert(saleItems).values(saleItemsToInsert);

      // 6) Update inventory - handle variants and products separately
      for (const line of lines) {
        if (line.variantId) {
          // Update variant stock
          await tx
            .update(productVariants)
            .set({
              stock: sql`${productVariants.stock} - ${line.quantity}`,
              sold_count: sql`${productVariants.sold_count} + ${line.quantity}`,
              last_sold_at: now,
            })
            .where(eq(productVariants.id, line.variantId));
        } else if (line.productId) {
          // Update product stock directly
          await tx
            .update(productsTable)
            .set({
              stock: sql`${productsTable.stock} - ${line.quantity}`,
            })
            .where(eq(productsTable.id, line.productId));
        }
      }

      // 7) Compute total and update sale header
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

    if (err.statusCode) {
      throw err;
    }

    if (err.name === 'ZodError') {
      throw createError({ statusCode: 400, message: 'Payload inválido' });
    }

    throw createError({
      statusCode: 500,
      message: 'Error al procesar la venta. Intenta de nuevo.',
    });
  }
});
