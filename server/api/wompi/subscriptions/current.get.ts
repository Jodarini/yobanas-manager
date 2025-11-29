import { serverSupabaseClient } from '#supabase/server';
import { subscriptions } from '~~/db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [sub] = await useAuthDB(user, async (tx) => {
    return await tx
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.user_id, user.id))
      .limit(1);
  });

  return sub || null;
});
