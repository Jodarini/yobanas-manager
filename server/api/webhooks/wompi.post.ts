// server/api/webhooks/wompi.post.ts
import { subscriptions, transactions, paymentSources } from '~~/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export const config = {
  csrf: false,
};

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const body = await readBody(event);

    console.log('📥 Webhook body:', body);
    console.log('📥 Wompi webhook received:', JSON.stringify(body, null, 2));

    // 1. Verify webhook signature (Wompi sends this in headers)
    const signature = getHeader(event, 'x-event-checksum');
    const timestamp = body.timestamp;
    const sentAt = body.sent_at;

    // Build the string Wompi uses for signature
    const signatureString = `${body.event}.${timestamp}.${JSON.stringify(body.data)}`;
    const expectedSignature = crypto
      .createHash('sha256')
      .update(signatureString + config.wompiEventsSecret) // You'll need this key from Wompi
      .digest('hex');

    // Verify signature (optional but recommended for production)
    // if (signature !== expectedSignature) {
    //   console.error('❌ Invalid webhook signature');
    //   throw createError({ statusCode: 401, message: 'Invalid signature' });
    // }

    // 2. Handle transaction.updated event
    if (body.event === 'transaction.updated') {
      const txData = body.data.transaction;

      console.log(
        '💳 Transaction updated:',
        txData.id,
        'Status:',
        txData.status
      );

      // Only process subscription transactions (reference starts with SUB-)
      if (!txData.reference.startsWith('SUB-')) {
        console.log('ℹ️  Not a subscription transaction, ignoring');
        return { received: true };
      }

      // Extract user_id from reference: SUB-{user_id_prefix}-{timestamp}
      const referenceParts = txData.reference.split('-');
      const userIdPrefix = referenceParts[1]; // First 8 chars of user_id

      // Get full transaction details from Wompi API
      const res = await fetch(
        `https://sandbox.wompi.co/v1/transactions/${txData.id}`,
        {
          headers: {
            Authorization: `Bearer ${config.wompiPrivateKey}`,
          },
        }
      );

      if (!res.ok) {
        console.error('❌ Error fetching transaction from Wompi');
        throw createError({
          statusCode: 500,
          message: 'Error fetching transaction',
        });
      }

      const wompiData = await res.json();
      const fullTxData = wompiData.data;

      console.log('📄 Full transaction data:', fullTxData);

      // Check if transaction already processed
      const db = useDB();
      const [existingTx] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.wompi_transaction_id, fullTxData.id))
        .limit(1);

      if (existingTx) {
        console.log('✅ Transaction already processed, skipping');
        return { received: true };
      }

      // Find user by matching user_id prefix in subscriptions or auth.users
      // We'll query Supabase auth to find the user
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        config.public.supabaseUrl, // ← Use config.public for public values
        config.supabaseServiceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      // List users and find by ID prefix
      const { data: users, error: usersError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (usersError) {
        console.error('❌ Error fetching users:', usersError);
        throw createError({ statusCode: 500, message: 'Error finding user' });
      }

      const user = users.users.find((u) => u.id.startsWith(userIdPrefix));

      if (!user) {
        console.error('❌ User not found for prefix:', userIdPrefix);
        throw createError({ statusCode: 404, message: 'User not found' });
      }

      console.log('👤 Found user:', user.email);

      // Determine plan from amount
      const planMap = {
        2500000: 'emprendedor',
        5000000: 'negocio',
      };
      const plan = planMap[fullTxData.amount_in_cents] || 'emprendedor';

      // Save to database
      await db.transaction(async (tx) => {
        // Save payment source if it exists
        if (fullTxData.payment_method?.extra?.external_identifier) {
          const paymentSourceId =
            fullTxData.payment_method.extra.external_identifier;

          const [existing] = await tx
            .select()
            .from(paymentSources)
            .where(eq(paymentSources.wompi_payment_source_id, paymentSourceId))
            .limit(1);

          if (!existing) {
            await tx.insert(paymentSources).values({
              user_id: user.id,
              wompi_payment_source_id: paymentSourceId,
              type: fullTxData.payment_method.type,
              status: 'AVAILABLE',
              card_brand: fullTxData.payment_method.extra?.brand,
              card_last_four: fullTxData.payment_method.extra?.last_four,
            });
            console.log('💾 Payment source saved');
          }
        }

        // Create or update subscription if payment approved
        if (fullTxData.status === 'APPROVED') {
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
                plan,
                status: 'active',
                current_period_start: now.toISOString(),
                current_period_end: periodEnd.toISOString(),
                updated_at: now.toISOString(),
              })
              .where(eq(subscriptions.id, existingSub.id));
            console.log('🔄 Subscription updated');
          } else {
            await tx.insert(subscriptions).values({
              user_id: user.id,
              plan,
              status: 'active',
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
            });
            console.log('✨ Subscription created');
          }
        }

        // Save transaction
        await tx.insert(transactions).values({
          user_id: user.id,
          wompi_transaction_id: fullTxData.id,
          amount_in_cents: fullTxData.amount_in_cents,
          status: fullTxData.status,
          reference: fullTxData.reference,
        });
        console.log('💾 Transaction saved');
      });

      console.log('✅ Webhook processed successfully');
    }

    return { received: true };
  } catch (error) {
    console.error('❌ Webhook error:', error);
    throw error;
  }
});
