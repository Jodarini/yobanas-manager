import { serverSupabaseClient } from '#supabase/server';
import { productVariants, saleItems, sales, productsTable } from '~~/db/schema';
import { eq, sql, gte } from 'drizzle-orm';

type Filter = 'dia' | 'semana' | 'mes' | 'trimestre' | 'año'

const intervalByFilter: Record<Filter, string> = {
  dia: '1 day',
  semana: '7 days',
  mes: '1 month',
  trimestre: '3 months',
  año: '1 year',
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }
  const period = getQuery(event).filter || '30 days';
  const interval = intervalByFilter[period]
  try {
    return await useAuthDB(user, async (tx) => {
      const saleData = await tx
        .select()
        .from(sales)
        .where(sql`${sales.created_at} > NOW() - INTERVAL '${sql.raw(interval)}'`);


      const sale_items = await tx
        .select()
        .from(saleItems)
        .leftJoin(
          productVariants,
          eq(productVariants.id, saleItems.product_variant_id)
        )
        .leftJoin(
          productsTable,
          sql`${productsTable.id} = COALESCE(${productVariants.productId}, ${saleItems.product_id})`
        )

      return {
        sales: saleData,
        sale_items: sale_items,
      };
    });
  } catch (err) {
    console.error('Error processing checkout:', err);
  }
});
