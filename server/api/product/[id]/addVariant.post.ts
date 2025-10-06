import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { addVariantSchema, productVariants } from '~/db/schema';

export default defineEventHandler(async (event) => {
  const connectionString = process.env.TEST_SUPABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    const body = await readBody(event);
    const product = addVariantSchema.parse(body);
    if (!product.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product ID is required',
      });
    }

    if (!product.variantInfo.color) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product color is required',
      });
    }

    if (!product.variantInfo.size) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product size is required',
      });
    }

    if (!product.variantInfo.stock) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product stock is required',
      });
    }

    await db.insert(productVariants).values({
      productId: product.id,
      color: product.variantInfo.color,
      size: product.variantInfo.size,
      stock: product.variantInfo.stock,
    });
    console.log('added');
  } catch (error) {
    console.error('Error adding product:', error);
  }
});
