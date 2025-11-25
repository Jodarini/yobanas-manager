import { serverSupabaseClient } from '#supabase/server';
import { saleItems, sales } from '~~/db/schema';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  try {
    return await useAuthDB(user, async (tx) => {
      const saleData = await tx.select().from(sales);
      const sale_items = await tx.select().from(saleItems);

      return {
        sales: saleData,
        sale_items: sale_items,
      };
    });
  } catch (err) {
    console.error('Error processing checkout:', err);
  }
});
