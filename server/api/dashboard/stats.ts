import { serverSupabaseClient } from '#supabase/server';
import { count, eq, sql, sum } from 'drizzle-orm';
import { productsTable, productVariants } from '~~/db/schema';

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
    const data = await useAuthDB(user, (tx) =>
      tx.select({
        value: sql<number>`sum(${productsTable.price} * ${productVariants.stock})`.mapWith(Number),
        stock: sum(productVariants.stock).mapWith(Number)
      }).from(productVariants).leftJoin(productsTable, eq(productVariants.productId, productsTable.id))
    )
    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Productos no encontrados',
      });
    }
    return { stock: data[0].stock, value: data[0].value };
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor',
    });
  }

})
