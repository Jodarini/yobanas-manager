import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { serverSupabaseClient } from '#supabase/server';
import { eq } from 'drizzle-orm';
import type { ProductWithVariants } from '~/db/schema';
import { productsTable, productVariants } from '~/db/schema';
import { createError, defineEventHandler, getRouterParam } from 'h3';

async function getProductWithVariants(
  productId: number,
  db: PostgresJsDatabase
): Promise<ProductWithVariants | null> {
  const productRow = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .limit(1);
  if (!productRow.length) return null;

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  return {
    ...productRow[0],
    variants,
  };
}

export default defineEventHandler(
  async (event): Promise<ProductWithVariants | null> => {
    const id = getRouterParam(event, 'id');
    const supabase = await serverSupabaseClient(event);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    return await useAuthDB(session, async (db) => {
      return getProductWithVariants(Number(id), db);
    });
  }
);
