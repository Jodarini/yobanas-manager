import { serverSupabaseClient } from '#supabase/server';
import { productVariants, saleItems, sales, productsTable } from '~~/db/schema';
import { eq, sql } from 'drizzle-orm';

type Filter = 'dia' | 'semana' | 'mes' | 'trimestre' | 'año' | 'todo';

const intervalByFilter: Record<Filter, string> = {
  dia: '1 day',
  semana: '7 days',
  mes: '1 month',
  trimestre: '3 months',
  año: '1 year',
  todo: '',
};

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const query = getQuery(event);
  const rawFilter = query.filter ? String(query.filter) : 'mes';
  const period: Filter =
    rawFilter in intervalByFilter ? (rawFilter as Filter) : 'mes';
  const interval = intervalByFilter[period];
  const dateFilter = interval
    ? sql`${sales.created_at} > NOW() - INTERVAL '${sql.raw(interval)}'`
    : undefined;

  const dateFilterItems = interval
    ? sql`${saleItems.created_at} > NOW() - INTERVAL '${sql.raw(interval)}'`
    : undefined;
  try {
    return await useAuthDB(user, async (tx) => {
      const saleData = await tx.select().from(sales).where(dateFilter);

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
        .where(dateFilterItems);

      return {
        sales: saleData,
        sale_items: sale_items,
      };
    });
  } catch (err) {
    console.error('Error processing checkout:', err);
  }
});
