// server/api/payment-sources/save.post.ts
import { serverSupabaseClient } from '#supabase/server';
import { paymentSources } from '~~/db/schema';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const body = await readBody<{
    wompiPaymentSourceId: number;
    type: string;
    status: string;
    cardBrand?: string;
    cardLastFour?: string;
    phoneNumber?: string;
  }>(event);

  return await useAuthDB(user, async (tx) => {
    const [inserted] = await tx
      .insert(paymentSources)
      .values({
        user_id: user.id,
        wompi_payment_source_id: body.wompiPaymentSourceId,
        type: body.type,
        status: body.status,
        card_brand: body.cardBrand,
        card_last_four: body.cardLastFour,
        phone_number: body.phoneNumber,
      })
      .returning();

    return inserted;
  });
});
