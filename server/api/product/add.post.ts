import {
  insertProductSchema,
  productsTable,
  productVariants,
} from '~~/db/schema';
import { useAuthDB } from '~~/server/utils/db';
import { serverSupabaseClient } from '#supabase/server';
import { buildProductSku, buildVariantSku } from '~~/db/utils/sku';
import { and, eq } from 'drizzle-orm';

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

  const productSku = buildProductSku({
    brand: product.brand,
    category: product.category[0] || 'misc',
    model: product.title,
  });
  try {
    return await useAuthDB(user, async (tx) => {
      if (product.stock) {
        await tx.insert(productsTable).values({
          user_id: user.id,
          sku: productSku,
          title: product.title,
          description: product.description,
          price: String(product.price),
          brand: product.brand,
          thumbnail:
            product.thumbnail ||
            'https://cdn.dummyjson.com/products/VERYPOGGERSs/mens-shoes/Nike%20Air%20Jordan%201%20Red%20And%20Black/1.png',
          category: product.category || 'NONE',
          stock: product.stock,
        });
        return;
      }
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
      const existingProduct = await useAuthDB(user, async (tx) => {
        const results = await tx
          .select({
            id: productsTable.id,
            title: productsTable.title,
            deleted_at: productsTable.deleted_at,
          })
          .from(productsTable)
          .where(
            and(
              eq(productsTable.sku, productSku),
              eq(productsTable.user_id, user.id)
            )
          )
          .limit(1);

        return results[0];
      });
      console.log('product exists', existingProduct);
      // Handle based on deletion status
      if (existingProduct?.deleted_at) {
        throw createError({
          statusCode: 409,
          message: 'SKU Previously Deleted',
          statusMessage:
            'Este SKU pertenece a un producto eliminado. Puedes restaurarlo o eliminarlo permanentemente.',
          data: {
            existingProductId: existingProduct.id,
            existingProductTitle: existingProduct.title,
            isDeleted: true,
          },
        });
      } else {
        throw createError({
          statusCode: 409,
          statusMessage: 'Duplicate SKU',
          message: 'Un producto activo con este SKU ya existe',
          data: {
            existingProductId: existingProduct?.id,
            existingProductTitle: existingProduct?.title,
            isDeleted: false,
          },
        });
      }
    }
    console.error('Error adding product:', error);
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to add product',
    });
  }
});
