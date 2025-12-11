import {
  insertProductSchema,
  productsTable,
  productVariants,
  subscriptions,
} from '~~/db/schema';
import { useAuthDB } from '~~/server/utils/db';
import { serverSupabaseClient } from '#supabase/server';
import { buildProductSku, buildVariantSku } from '~~/db/utils/sku';
import { and, eq, isNull, sql } from 'drizzle-orm';

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

  console.log('validationResult', validationResult.data);

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

  const limits: Record<string, number> = {
    gratis: 5,
    negocio: 500,
    emprendedor: 9999999,
  };
  try {
    return await useAuthDB(user, async (tx) => {
      const subscription = await tx
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.user_id, user.id));

      const [products] = await tx
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(productsTable)
        .where(
          and(
            eq(productsTable.user_id, user.id),
            isNull(productsTable.deleted_at)
          )
        );
      if (!subscription[0]) {
        throw createError({
          statusCode: 400,
          message: 'No active subscription found',
        });
      }

      const limit = limits[subscription[0].plan] ?? 5;
      if (products.count >= limit) {
        throw new Error(`LIMIT_REACHED:${subscription[0].plan}:${limit}`);
      }

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
          category: product.category,
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
          price: String(product.price),
          brand: product.brand,
          thumbnail:
            product.thumbnail ||
            'https://cdn.dummyjson.com/products/VERYPOGGERSs/mens-shoes/Nike%20Air%20Jordan%201%20Red%20And%20Black/1.png',
          category: product.category,
          stock: null,
        })
        .returning();

      for (const variant of product.variants || []) {
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
    const err = error as any;
    if (err.message?.startsWith('LIMIT_REACHED:')) {
      const [, plan, limit] = err.message.split(':');
      throw createError({
        statusCode: 403,
        message: `Has alcanzado el límite de ${limit} productos para tu plan ${plan}`,
      });
    }

    if (err.code === '23505') {
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
