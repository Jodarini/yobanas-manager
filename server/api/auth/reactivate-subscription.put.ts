import { subscriptions } from '~~/db/schema';
import { serverSupabaseClient } from '#supabase/server';
import { eq } from 'drizzle-orm';

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
    const update = await useAuthDB(user, (tx) =>
      tx
        .update(subscriptions)
        .set({
          cancel_at_period_end: 0,
        })
        .where(eq(subscriptions.user_id, user.id))
    );
    console.log(update);
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      message: 'Error al actualizar la suscripción',
    });
  }
});
