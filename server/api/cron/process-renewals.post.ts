import { subscriptions, transactions, paymentSources } from '~~/db/schema';
import { lt, eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // 1. Verify cron secret (Vercel automatically sends this)
  const authHeader = getHeader(event, 'authorization');
  const expectedAuth = `Bearer ${config.cronSecret}`;
  console.log('Received auth:', authHeader);
  console.log('Expected auth:', expectedAuth);
  console.log('cronSecret from config:', config.cronSecret);
  console.log('Supabase URL:', config.public.supabaseUrl);
  console.log('Service Role Key exists:', !!config.supabaseServiceRoleKey);
  console.log('Service Role Key length:', config.supabaseServiceRoleKey?.length);

  if (authHeader !== expectedAuth) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Invalid cron secret',
    });
  }

  console.log('🔄 Starting renewal processing...');

  // 2. Use direct DB connection (bypass RLS for system operations)
  const db = useDB();

  // 3. Find subscriptions expiring today or past due
  const now = new Date();

  const expiringSubscriptions = await db
    .select({
      id: subscriptions.id,
      user_id: subscriptions.user_id,
      plan: subscriptions.plan,
      current_period_end: subscriptions.current_period_end,
      cancel_at_period_end: subscriptions.cancel_at_period_end,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, 'active'),
        lt(subscriptions.current_period_end, now.toISOString()), // Compare to NOW
        eq(subscriptions.cancel_at_period_end, 0)
      )
    );
  console.log(
    `📋 Found ${expiringSubscriptions.length} subscriptions to renew`
  );

  // 4. Find subscriptions scheduled for cancellation
  const cancellingSubscriptions = await db
    .select({
      id: subscriptions.id,
      user_id: subscriptions.user_id,
      plan: subscriptions.plan,
      current_period_end: subscriptions.current_period_end,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, 'active'),
        eq(subscriptions.cancel_at_period_end, 1),
        lt(subscriptions.current_period_end, now.toISOString())
      )
    );

  console.log(
    `🛑 Found ${cancellingSubscriptions.length} subscriptions to cancel`
  );

  type RenewalResult = {
    subId: number;
    status:
    | 'cancelled_at_period_end'
    | 'cancel_error'
    | 'failed'
    | 'error'
    | 'renewed'
    | 'pending'
    | 'declined';
    previousPlan?: string | null;
    error?: string;
    reason?: string;
    txId?: string;
  };

  const results: RenewalResult[] = [];
  const plans: Record<string, number> = {
    emprendedor: 2500000,
    negocio: 5000000,
  };

  // Get Supabase Admin for user lookups
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

  // 5. PROCESS CANCELLATIONS FIRST
  for (const sub of cancellingSubscriptions) {
    try {
      await db
        .update(subscriptions)
        .set({
          plan: 'gratis',
          status: 'cancelled',
          cancel_at_period_end: 0,
          updated_at: new Date().toISOString(),
        })
        .where(eq(subscriptions.id, sub.id));

      console.log(`🛑 Subscription ${sub.id} cancelled at period end`);
      results.push({
        subId: sub.id,
        status: 'cancelled_at_period_end',
        previousPlan: sub.plan,
      });

      // Get user for email
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
        sub.user_id
      );

      if (userData?.user) {
        // TODO: Send cancellation confirmation email
        console.log(
          `📧 Should send cancellation email to ${userData.user.email}`
        );
      }
    } catch (error) {
      const err = error as Error;
      console.error(`❌ Error cancelling subscription ${sub.id}:`, error);
      results.push({
        subId: sub.id,
        status: 'cancel_error',
        error: err.message,
      });
    }
  }

  // 6. PROCESS RENEWALS
  for (const sub of expiringSubscriptions) {
    try {
      // Get user's payment source
      const [paymentSource] = await db
        .select()
        .from(paymentSources)
        .where(
          and(
            eq(paymentSources.user_id, sub.user_id),
            eq(paymentSources.status, 'AVAILABLE')
          )
        )
        .limit(1);

      if (!paymentSource) {
        console.error(`❌ No payment source for user ${sub.user_id}`);

        // Mark subscription as past_due
        await db
          .update(subscriptions)
          .set({ status: 'past_due' })
          .where(eq(subscriptions.id, sub.id));

        results.push({
          subId: sub.id,
          status: 'failed',
          reason: 'no_payment_source',
        });

        // Get user for email
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
          sub.user_id
        );
        if (userData?.user) {
          // TODO: Send "payment method missing" email
          console.log(
            `📧 Should send payment method missing email to ${userData.user.email}`
          );
        }

        continue;
      }

      const planCost = plans[sub.plan];
      if (!planCost) {
        console.error(`❌ Unknown plan ${sub.plan} for subscription ${sub.id}`);
        continue;
      }

      const amountInCents = planCost;
      const reference = `RENEWAL-${sub.id}-${Date.now()}`;

      // Build signature for Wompi
      const signatureString = `${reference}${amountInCents}COP${config.wompiIntegrityKey}`;
      const signature = crypto
        .createHash('sha256')
        .update(signatureString)
        .digest('hex');

      // Get user email from Supabase
      const { data: userData, error: userError } =
        await supabaseAdmin.auth.admin.getUserById(sub.user_id);

      if (userError || !userData.user) {
        console.error(`❌ Error fetching user ${sub.user_id}:`, userError);
        results.push({
          subId: sub.id,
          status: 'error',
          reason: 'user_not_found',
        });
        continue;
      }

      if (!userData.user) {
        console.error(`❌ User data missing for ${sub.user_id}`);
        results.push({
          subId: sub.id,
          status: 'error',
          reason: 'user_data_missing',
        });
        continue;
      }
      console.log('🔍 Payment Source Debug:');
      console.log('Raw wompi_payment_source_id:', paymentSource.wompi_payment_source_id);
      console.log('Type:', typeof paymentSource.wompi_payment_source_id);
      console.log('Parsed:', parseInt(paymentSource.wompi_payment_source_id));
      console.log('Is NaN?:', isNaN(parseInt(paymentSource.wompi_payment_source_id)));

      // Charge via Wompi
      const wompiPayload = {
        amount_in_cents: amountInCents,
        currency: 'COP',
        customer_email: userData.user.email,
        reference,
        payment_source_id: parseInt(paymentSource.wompi_payment_source_id),
        payment_method: {
          installments: 1,
        },
        signature,
      };

      console.log('📤 Wompi Payload:', JSON.stringify(wompiPayload, null, 2));

      console.log(
        `💳 Charging ${amountInCents} COP for subscription ${sub.id}`
      );

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
        console.error(`❌ Wompi error for sub ${sub.id}:`, errorText);

        await db
          .update(subscriptions)
          .set({ status: 'past_due' })
          .where(eq(subscriptions.id, sub.id));

        results.push({
          subId: sub.id,
          status: 'failed',
          reason: 'payment_gateway_error',
        });

        // TODO: Send payment failed email
        console.log(
          `📧 Should send payment gateway error email to ${userData.user.email}`
        );
        continue;
      }

      const wompiData = await res.json();
      const txData = wompiData.data;

      console.log(
        `✅ Transaction created: ${txData.id}, Status: ${txData.status}`
      );

      // Record transaction immediately (webhook will update subscription)
      await db.insert(transactions).values({
        user_id: sub.user_id,
        subscription_id: sub.id,
        payment_source_id: paymentSource.id,
        wompi_transaction_id: txData.id,
        amount_in_cents: amountInCents,
        currency: 'COP',
        status: txData.status,
        reference,
      });

      // If immediately approved, update subscription (webhook might be delayed)
      if (txData.status === 'APPROVED') {
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await db
          .update(subscriptions)
          .set({
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            status: 'active',
            updated_at: now.toISOString(),
          })
          .where(eq(subscriptions.id, sub.id));

        console.log(`🎉 Subscription ${sub.id} renewed successfully`);
        results.push({ subId: sub.id, status: 'renewed', txId: txData.id });

        // TODO: Send renewal success email
        console.log(
          `📧 Should send renewal success email to ${userData.user.email}`
        );
      } else if (txData.status === 'PENDING') {
        results.push({ subId: sub.id, status: 'pending', txId: txData.id });
      } else {
        await db
          .update(subscriptions)
          .set({ status: 'past_due' })
          .where(eq(subscriptions.id, sub.id));

        results.push({
          subId: sub.id,
          status: 'declined',
          txId: txData.id,
        });

        // TODO: Send payment declined email
        console.log(
          `📧 Should send payment declined email to ${userData.user.email}`
        );
      }
    } catch (error) {
      const err = error as Error;
      console.error(`❌ Error processing subscription ${sub.id}:`, error);
      results.push({
        subId: sub.id,
        status: 'error',
        error: err.message,
      });
    }
  }

  console.log('✅ Renewal processing completed');

  return {
    processed: results.length,
    renewed: results.filter((r) => r.status === 'renewed').length,
    cancelled: results.filter((r) => r.status === 'cancelled_at_period_end')
      .length,
    failed: results.filter(
      (r) => r.status === 'failed' || r.status === 'declined'
    ).length,
    results,
    timestamp: new Date().toISOString(),
  };
});
