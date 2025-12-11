import { eq } from 'drizzle-orm';
import { productsTable } from '~~/db/schema';
import { serverSupabaseClient } from '#supabase/server';

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

  const { id } = getRouterParams(event);

  if (!id || isNaN(parseInt(id))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid product ID',
    });
  }

  const productId = parseInt(id);

  try {
    const result = await useAuthDB(user, async (db) => {
      return await db
        .update(productsTable)
        .set({ deleted_at: new Date().toISOString() })
        .where(eq(productsTable.id, productId))
        .returning();
    });
    console.log(result);
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
