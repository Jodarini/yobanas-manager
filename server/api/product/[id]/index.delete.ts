import { eq } from 'drizzle-orm';
import { productsTable } from '~/db/schema';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event);

  if (!id || isNaN(parseInt(id))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid product ID',
    });
  }

  const productId = parseInt(id);

  const supabase = await serverSupabaseClient(event);
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get session',
    });
  }

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  try {
    const result = await useAuthDB(session, async (db) => {
      return await db
        .delete(productsTable)
        .where(eq(productsTable.id, productId))
        .returning();
    });
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found',
      });
    }
    return result[0];
  } catch (err) {
    console.error('Error deleting the product', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete product',
    });
  }
});
