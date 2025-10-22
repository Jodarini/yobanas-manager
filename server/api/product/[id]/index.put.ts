import { serverSupabaseClient } from '#supabase/server';
import { eq } from 'drizzle-orm';
import {
  editProductSchema2,
  productsTable,
  productVariants,
} from '~/db/schema';
import { useAuthDB } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  try {
    const body = await readBody(event);
    const product = editProductSchema2.parse(body);

    return await useAuthDB(session, async (tx) => {
      const result = await tx
        .update(productsTable)
        .set({
          title: product.productInfo.title,
          description: product.productInfo.description,
          price: product.productInfo.price,
          category: product.productInfo.category,
          brand: product.productInfo.brand,
        })
        .where(eq(productsTable.id, product.productInfo.id))
        .returning();

      await tx
        .delete(productVariants)
        .where(eq(productVariants.productId, product.productInfo.id));

      await tx.insert(productVariants).values(
        product.variantInfo.map((v) => ({
          productId: product.productInfo.id,
          user_id: session.user.id, // Add user_id
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
