import { serverSupabaseClient } from '#supabase/server';
import { eq } from 'drizzle-orm';
import { productsTable, updateProductSchema2 } from '~~/db/schema';
import { useAuthDB } from '~~/server/utils/db';
import { buildProductSku } from '~~/db/utils/sku';

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
    console.log({ body });
    const product = updateProductSchema2.parse(body);

    return await useAuthDB(user, async (tx) => {
      const productSku = buildProductSku({
        brand: product.brand,
        category: product.category[0] || 'misc',
        model: product.title,
      });

      // Only update product info, never touch variants
      const result = await tx
        .update(productsTable)
        .set({
          title: product.title,
          description: product.description,
          price: String(product.price),
          category: product.category,
          brand: product.brand,
          sku: productSku,
        })
        .where(eq(productsTable.id, product.id))
        .returning();

      // Variants are NOT modified in product update
      // You should handle variant changes in a separate endpoint

      return {
        message: 'Producto actualizado',
        product: {
          productInfo: result,
        },
      };
    });
  } catch (err) {
    console.error('Error parsing the body', err);
    throw err;
  }
});
