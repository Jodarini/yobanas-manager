import { subscriptions } from '~~/db/schema';
import { serverSupabaseClient } from '#supabase/server';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  return await useAuthDB(user, async (tx) => {
    await tx
      .update(subscriptions)
      .set({
        cancel_at_period_end: 0,
        updated_at: new Date().toISOString(),
      })
      .where(eq(subscriptions.user_id, user.id));

    return { message: 'Suscripción reactivada' };
  });
});
