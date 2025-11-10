import {
  insertProductSchema,
  productsTable,
  productVariants,
} from '~~/db/schema';
import { useAuthDB } from '~~/server/utils/db';
import { serverSupabaseClient } from '#supabase/server';
import { buildProductSku, buildVariantSku } from '~~/db/utils/sku';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please sign in',
    });
  }

  const body = await readBody(event);
  const validationResult = insertProductSchema.safeParse(body);

  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      message: validationResult.error.issues.map((i) => i.message).join(', '),
    });
  }

  const product = validationResult.data;

  try {
    return await useAuthDB(user, async (tx) => {
      const productSku = buildProductSku({
        brand: product.brand,
        category: product.category[0] || 'misc',
        model: product.title,
      });

      const queryResult = await tx
        .insert(productsTable)
        .values({
          user_id: user.id,
          sku: productSku,
          title: product.title,
          description: product.description,
          price: product.price,
          brand: product.brand,
          thumbnail:
            product.thumbnail ||
            'https://cdn.dummyjson.com/products/VERYPOGGERSs/mens-shoes/Nike%20Air%20Jordan%201%20Red%20And%20Black/1.png',
          category: product.category || 'NONE',
        })
        .returning();

      for (const variant of product.variants) {
        const variantSku = buildVariantSku({
          productSku,
          color: variant.color,
          size: variant.size,
        });
        await tx.insert(productVariants).values({
          productId: queryResult[0].id,
          user_id: user.id,
          color: variant.color,
          size: variant.size,
          stock: variant.stock,
          sku: variantSku,
        });
      }
      return { product: queryResult[0] };
    });
  } catch (error) {
    if (error.code === '23505') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Duplicate SKU',
        message: 'Un producto con este SKU ya existe',
      });
    }
    console.error('Error adding product:', error);
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to add product',
    });
  }
});
