import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  insertProductSchema,
  productsTable,
  productVariants,
} from '~/db/schema';

export default defineEventHandler(async (event) => {
  const connectionString = process.env.TEST_SUPABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);

  const body = await readBody(event);
  const product = insertProductSchema.parse(body);

  try {
    return await db.transaction(async (tx) => {

      const queryResult = await tx.insert(productsTable).values({
        title: product.productInfo.title,
        description: product.productInfo.description,
        price: product.productInfo.price,
        brand: product.productInfo.brand,
        thumbnail: product.productInfo.thumbnail || 'https://cdn.dummyjson.com/products/VERYPOGGERSs/mens-shoes/Nike%20Air%20Jordan%201%20Red%20And%20Black/1.png',
        category: product.productInfo.category || 'NONE',
      }).returning()

      for (const variant of product.variantInfo) {
        await tx.insert(productVariants).values({
          productId: queryResult[0].id,
          color: variant.color,
          size: variant.size,
          stock: variant.stock
        })
      }

      return { product: queryResult[0] }

    })
  } catch (error) {
    console.error('Error adding product:', error);
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to add product',
    });
  }
})


