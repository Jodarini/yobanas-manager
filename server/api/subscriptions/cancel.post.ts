import { serverSupabaseClient } from '#supabase/server';
import { subscriptions } from '~~/db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const body = await readBody<{
    immediately?: boolean;
  }>(event);

  return await useAuthDB(user, async (tx) => {
    const [subscription] = await tx
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.user_id, user.id))
      .limit(1);

    if (!subscription) {
      throw createError({
        statusCode: 404,
        message: 'No subscription found',
      });
    }

    // Check if already cancelled
    if (subscription.status === 'cancelled') {
      throw createError({
        statusCode: 400,
        message: 'Esta suscripción ya está cancelada',
      });
    }

    // Check if not on a paid plan
    if (subscription.plan === 'gratis') {
      throw createError({
        statusCode: 400,
        message: 'Ya estás en el plan gratuito',
      });
    }

    // Check if already scheduled for cancellation
    if (subscription.cancel_at_period_end === 1 && !body.immediately) {
      throw createError({
        statusCode: 400,
        message:
          'Esta suscripción ya está programada para cancelarse al final del período',
      });
    }

    if (body.immediately) {
      // Cancel immediately - downgrade to free plan now
      await tx
        .update(subscriptions)
        .set({
          plan: 'gratis',
          status: 'cancelled',
          cancel_at_period_end: 0,
          updated_at: new Date().toISOString(),
        })
        .where(eq(subscriptions.user_id, user.id));

      return {
        message: 'Suscripción cancelada inmediatamente',
        plan: 'gratis',
        cancelledAt: new Date().toISOString(),
      };
    } else {
      // Cancel at period end - keep benefits until then
      await tx
        .update(subscriptions)
        .set({
          cancel_at_period_end: 1,
          updated_at: new Date().toISOString(),
        })
        .where(eq(subscriptions.user_id, user.id));

      return {
        message: 'Suscripción se cancelará al final del período',
        currentPeriodEnd: subscription.current_period_end,
        plan: subscription.plan,
      };
    }
  });
});
