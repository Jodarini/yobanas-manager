import { serverSupabaseClient } from '#supabase/server';
import { eq } from 'drizzle-orm';
import { productsTable, updateProductSchema2 } from '~~/db/schema';
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
    const product = updateProductSchema2.parse(body);

    return await useAuthDB(user, async (tx) => {
      const result = await tx
        .update(productsTable)
        .set({
          title: product.title,
          description: product.description,
          price: String(product.price),
          category: product.category,
          brand: product.brand,
          stock: product.stock || null,
        })
        .where(eq(productsTable.id, product.id))
        .returning();

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
