import { serverSupabaseClient } from '#supabase/server';
import { eq, sql } from 'drizzle-orm';
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
      tx
        .select({
          value: sql<number>`
            COALESCE(
              SUM(
                CASE 
                  WHEN ${productVariants.id} IS NOT NULL 
                  THEN ${productsTable.price} * ${productVariants.stock}
                  ELSE ${productsTable.price} * COALESCE(${productsTable.stock}, 0)
                END
              ),
              0
            )
          `.mapWith(Number),
          stock: sql<number>`
            COALESCE(
              SUM(
                CASE 
                  WHEN ${productVariants.id} IS NOT NULL 
                  THEN ${productVariants.stock}
                  ELSE COALESCE(${productsTable.stock}, 0)
                END
              ),
              0
            )
          `.mapWith(Number),
        })
        .from(productsTable)
        .leftJoin(
          productVariants,
          eq(productsTable.id, productVariants.productId)
        )
    );

    return {
      stock: data[0].stock ?? 0,
      value: data[0].value ?? 0
    };
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor',
    });
  }
});

