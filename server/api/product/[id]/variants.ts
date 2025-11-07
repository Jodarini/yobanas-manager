import { serverSupabaseClient } from '#supabase/server';
import { eq } from 'drizzle-orm';
import { productVariants } from '~~/db/schema';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const supabase = await serverSupabaseClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  return await useAuthDB(user, async (db) => {
    return await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, Number(id)));
  });
});
