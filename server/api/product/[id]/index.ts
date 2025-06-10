import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import type { ProductWithVariant } from '~/db/schema';
import { productsTable, productVariants } from '~/db/schema';

async function getProductWithVariants(
  productId: number,
  db: PostgresJsDatabase
) {
  const [productData, variants] = await Promise.all([
    db
      .select()
      .from(productVariants)
      .innerJoin(productsTable, eq(productsTable.id, productId))
      .where(eq(productVariants.productId, productId))
      .limit(1),
    db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId)),
  ]);

  if (productData.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found',
    });
  }

  const product: ProductWithVariant = {
    productInfo: productData[0].products,
    variantInfo: productData[0].product_variants,
  };
  return { product, variants };
}
export default defineEventHandler(async (event) => {
  const connectionString = process.env.TEST_SUPABASE_URL!;

  const client = postgres(connectionString);
  const db = drizzle(client);
  const { id } = getRouterParams(event);
  const productId = parseInt(id);

  try {
    return await getProductWithVariants(productId, db);
  } catch (err) {
    console.error('Error parsing the body', err);
    throw err;
  } finally {
    await client.end();
  }
});
