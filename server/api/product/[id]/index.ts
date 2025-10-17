import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import type { ProductWithVariant } from '~/db/schema';
import { productsTable, productVariants } from '~/db/schema';
import { createError, defineEventHandler, getRouterParam } from 'h3';
import { useDB } from '~/server/utils/db';

function parseId(param: string | undefined): number | null {
  const id = Number(param);
  return Number.isFinite(id) ? id : null;
}

async function getProductWithVariants(
  productId: number,
  db: PostgresJsDatabase
): Promise<ProductWithVariant | null> {

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
  const db = useDB()
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

  return data;
});
