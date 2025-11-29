// server/api/subscriptions/charge.post.ts
import { serverSupabaseClient } from '#supabase/server';
import { paymentSources } from '~~/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const supabase = await serverSupabaseClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const body = await readBody<{
    amountInCents: number;
    reference: string; // Your internal order/subscription ID
  }>(event);

  // 1. Get user's payment source from your DB
  const [source] = await useAuthDB(user, async (tx) => {
    return await tx
      .select()
      .from(paymentSources)
      .where(eq(paymentSources.user_id, user.id))
      .limit(1);
  });

  if (!source) {
    throw createError({ statusCode: 404, message: 'No payment method found' });
  }

  // Build integrity signature - CORRECT format
  const signatureString = `${body.reference}${body.amountInCents}COP${config.wompiIntegrityKey}`;
  const signature = crypto
    .createHash('sha256')
    .update(signatureString)
    .digest('hex');

  // 3. Create transaction
  const wompiPayload = {
    amount_in_cents: body.amountInCents,
    currency: 'COP',
    customer_email: user.email,
    reference: body.reference,
    payment_source_id: source.wompi_payment_source_id,
    payment_method: {
      installments: 1,
    },
    signature,
  };

  const res = await fetch('https://sandbox.wompi.co/v1/transactions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.wompiPrivateKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(wompiPayload),
  });

  if (!res.ok) {
    throw createError({
      statusCode: res.status,
      statusMessage: await res.text(),
    });
  }

  const data = await res.json();
  return {
    id: data.data.id,
    status: data.data.status,
    reference: data.data.reference,
    amountInCents: data.data.amount_in_cents,
  };
});
