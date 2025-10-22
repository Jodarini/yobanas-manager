import {
  insertProductSchema,
  productsTable,
  productVariants,
} from '~/db/schema';
import { useAuthDB } from '~/server/utils/db';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
  // Get Supabase client from the server utils
  const supabase = await serverSupabaseClient(event);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please sign in',
    });
  }

  const body = await readBody(event);
  const product = insertProductSchema.parse(body);
  product.productInfo.category.forEach((category) => {
    console.log(category);
  });

  try {
    return await useAuthDB(session, async (tx) => {
      const queryResult = await tx
        .insert(productsTable)
        .values({
          user_id: session.user.id,
          title: product.productInfo.title,
          description: product.productInfo.description,
          price: product.productInfo.price,
          brand: product.productInfo.brand,
          thumbnail:
            product.productInfo.thumbnail ||
            'https://cdn.dummyjson.com/products/VERYPOGGERSs/mens-shoes/Nike%20Air%20Jordan%201%20Red%20And%20Black/1.png',
          category: product.productInfo.category || 'NONE',
        })
        .returning();

      for (const variant of product.variantInfo) {
        await tx.insert(productVariants).values({
          productId: queryResult[0].id,
          user_id: session.user.id,
          color: variant.color,
          size: variant.size,
          stock: variant.stock,
        });
      }

      return { product: queryResult[0] };
    });
  } catch (error) {
    console.error('Error adding product:', error);
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to add product',
    });
  }
});
