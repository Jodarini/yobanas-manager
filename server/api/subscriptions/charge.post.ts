import { serverSupabaseClient } from '#supabase/server';
import { paymentSources } from '~~/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // NEW: Allow cron jobs to bypass authentication
  const authHeader = getHeader(event, 'authorization');
  const isCronJob = authHeader === `Bearer ${config.cronSecret}`;

  let userId: string;

  if (isCronJob) {
    // Cron job - read userId from body
    const body = await readBody<{
      userId: string;
      amountInCents: number;
      reference: string;
    }>(event);

    userId = body.userId;
  } else {
    // Regular authenticated request
    const supabase = await serverSupabaseClient(event);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    userId = user.id;
  }

  const body = await readBody<{
    userId?: string;
    amountInCents: number;
    reference: string;
  }>(event);

  // 1. Get user's payment source from DB (using direct DB, not useAuthDB)
  const db = useDB();
  const [source] = await db
    .select()
    .from(paymentSources)
    .where(eq(paymentSources.user_id, userId))
    .limit(1);

  if (!source) {
    throw createError({ statusCode: 404, message: 'No payment method found' });
  }

  // Get user email
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (!userData.user) {
    throw createError({ statusCode: 404, message: 'User not found' });
  }

  // Build integrity signature
  const signatureString = `${body.reference}${body.amountInCents}COP${config.wompiIntegrityKey}`;
  const signature = crypto
    .createHash('sha256')
    .update(signatureString)
    .digest('hex');

  // 3. Create transaction
  const wompiPayload = {
    amount_in_cents: body.amountInCents,
    currency: 'COP',
    customer_email: userData.user.email,
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
    const errorText = await res.text();
    throw createError({
      statusCode: res.status,
      message: errorText,
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
