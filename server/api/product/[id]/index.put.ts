import { serverSupabaseClient } from '#supabase/server';
import { eq } from 'drizzle-orm';
import {
  productsTable,
  productVariants,
  updateProductSchema,
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
    const product = updateProductSchema.parse(body);

    return await useAuthDB(user, async (tx) => {
      const result = await tx
        .update(productsTable)
        .set({
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          brand: product.brand,
        })
        .where(eq(productsTable.id, product.id))
        .returning();

      await tx
        .delete(productVariants)
        .where(eq(productVariants.productId, product.id));

      await tx.insert(productVariants).values(
        product.variants.map((v) => ({
          productId: product.id,
          user_id: user.id,
          size: v.size,
          color: v.color,
          stock: v.stock,
        }))
      );

      return {
        message: 'Editó el producto',
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
