import { serverSupabaseClient } from '#supabase/server';
import { productsTable } from '~~/db/schema';
import { useAuthDB } from '../utils/db';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  try {
    const products = await useAuthDB(user, (tx) =>
      tx.select().from(productsTable)
    );
    if (!products) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Productos no encontrados',
      });
    }
    return products;
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor',
    });
  }
});
