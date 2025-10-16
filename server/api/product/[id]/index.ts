import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import type { ProductWithVariant } from '~/db/schema';
import { productsTable, productVariants } from '~/db/schema';
import { createError, defineEventHandler, getRouterParam } from 'h3';

const connectionString = process.env.TEST_SUPABASE_URL!;
const sqlClient = postgres(connectionString, { max: 1 }); // module scope, shared
const db = drizzle(sqlClient);

// Utility for validating and parsing number input
function parseId(param: string | undefined): number | null {
  const id = Number(param);
  return Number.isFinite(id) ? id : null;
}

// Composable for fetching a product and its variants
async function getProductWithVariants(
  productId: number,
  db: PostgresJsDatabase
): Promise<ProductWithVariant | null> {

  // Get product
  const productRow = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .limit(1);
  if (!productRow.length) return null;

  // Get variants
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  return {
    productInfo: productRow[0],
    variantInfo: variants,
  };
}

export default defineEventHandler(async (event) => {
  const param = getRouterParam(event, 'id');
  const productId = parseId(param);

  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid product id",
    });
  }

  const data = await getProductWithVariants(productId, db);

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: "Product not found",
    });
  }

  return data; // Types automatically inferred (good for Nuxt typed $fetch)
});
