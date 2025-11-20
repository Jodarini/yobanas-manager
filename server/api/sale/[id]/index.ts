import { serverSupabaseClient } from '#supabase/server';
import { productsTable, productVariants, saleItems, sales } from '~~/db/schema';
import { eq, sql } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const id = Number(getRouterParam(event, 'id'));

  try {
    return await useAuthDB(user, async (tx) => {
      const salesData = await tx
        .select()
        .from(sales)
        .leftJoin(saleItems, eq(saleItems.sale_id, sales.id))
        .leftJoin(
          productVariants,
          eq(productVariants.id, saleItems.product_variant_id)
        )
        .leftJoin(
          productsTable,
          sql`${productsTable.id} = COALESCE(${productVariants.productId}, ${saleItems.product_id})`
        )
        .where(eq(sales.id, id));

      return salesData;
    });
  } catch (err) {
    console.error('Error processing checkout:', err);
  }
});
