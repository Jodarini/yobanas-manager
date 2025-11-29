// server/api/wompi/subscriptions/verify-payment.post.ts
import { serverSupabaseClient } from '#supabase/server';
import { subscriptions, transactions, paymentSources } from '~~/db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const supabase = await serverSupabaseClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const body = await readBody<{ transactionId: string }>(event);

  // Fetch transaction from Wompi
  const res = await fetch(
    `https://sandbox.wompi.co/v1/transactions/${body.transactionId}`,
    {
      headers: {
        Authorization: `Bearer ${config.wompiPrivateKey}`,
      },
    }
  );

  if (!res.ok) {
    throw createError({
      statusCode: 500,
      message: 'Error fetching transaction',
    });
  }

  const wompiData = await res.json();
  const txData = wompiData.data;

  console.log('Wompi transaction data:', txData);

  // Determine plan from amount
  const planMap = {
    2500000: 'emprendedor', // 25,000 COP
    5000000: 'negocio', // 50,000 COP
  };
  const plan = planMap[txData.amount_in_cents] || 'emprendedor';

  // Save to your DB
  await useAuthDB(user, async (tx) => {
    // Save payment source if it exists
    if (txData.payment_method?.extra?.external_identifier) {
      const paymentSourceId = txData.payment_method.extra.external_identifier;

      // Check if already exists
      const [existing] = await tx
        .select()
        .from(paymentSources)
        .where(eq(paymentSources.wompi_payment_source_id, paymentSourceId))
        .limit(1);

      if (!existing) {
        await tx.insert(paymentSources).values({
          user_id: user.id,
          wompi_payment_source_id: paymentSourceId,
          type: txData.payment_method.type,
          status: 'AVAILABLE',
          card_brand: txData.payment_method.extra?.brand,
          card_last_four: txData.payment_method.extra?.last_four,
        });
      }
    }

    // Create or update subscription if payment approved
    if (txData.status === 'APPROVED') {
      const [existingSub] = await tx
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.user_id, user.id))
        .limit(1);

      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      if (existingSub) {
        await tx
          .update(subscriptions)
          .set({
            plan, // ADD THIS
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            updated_at: now.toISOString(),
          })
          .where(eq(subscriptions.id, existingSub.id));
      } else {
        await tx.insert(subscriptions).values({
          user_id: user.id,
          plan, // ADD THIS
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        });
      }
    }

    // Save transaction
    await tx.insert(transactions).values({
      user_id: user.id,
      wompi_transaction_id: txData.id,
      amount_in_cents: txData.amount_in_cents,
      status: txData.status,
      reference: txData.reference,
    });
  });

  return {
    status: txData.status,
    reference: txData.reference,
  };
});
