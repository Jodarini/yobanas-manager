import { subscriptions, transactions, paymentSources } from '~~/db/schema';
import { eq } from 'drizzle-orm';
// import crypto from 'crypto';
import { z } from 'zod';

export const config = {
  csrf: false,
};

// Zod schemas for validation
const wompiTransactionSchema = z.object({
  id: z.string(),
  status: z.string(),
  reference: z.string(),
  amount_in_cents: z.number(),
  currency: z.string(),
  payment_method: z
    .object({
      type: z.string(),
      extra: z
        .object({
          external_identifier: z.string().optional(),
          brand: z.string().optional(),
          last_four: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

const wompiWebhookSchema = z.object({
  event: z.string(),
  timestamp: z.number(),
  data: z.object({
    transaction: wompiTransactionSchema,
  }),
});

const wompiApiResponseSchema = z.object({
  data: wompiTransactionSchema,
});

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();

    // Validate webhook body with Zod
    const bodyResult = wompiWebhookSchema.safeParse(await readBody(event));

    if (!bodyResult.success) {
      console.error('❌ Invalid webhook body:', bodyResult.error);
      throw createError({
        statusCode: 400,
        message: 'Invalid webhook payload',
        data: bodyResult.error,
      });
    }

    const body = bodyResult.data;

    console.log('📥 Wompi webhook received:', JSON.stringify(body, null, 2));

    // 1. Verify webhook signature (Wompi sends this in headers)
    // const signature = getHeader(event, 'x-event-checksum');
    // const timestamp = body.timestamp;

    // Build the string Wompi uses for signature
    // const signatureString = `${body.event}.${timestamp}.${JSON.stringify(body.data)}`;
    // const expectedSignature = crypto
    //   .createHash('sha256')
    //   .update(signatureString + config.wompiEventsSecret)
    //   .digest('hex');

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

      // Check if this is a subscription transaction
      const isInitialSub = txData.reference.startsWith('SUB-');
      const isRenewal = txData.reference.startsWith('RENEWAL-');

      if (!isInitialSub && !isRenewal) {
        console.log('ℹ️  Not a subscription transaction, ignoring');
        return { received: true };
      }

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

      const wompiJson = await res.json();

      // Validate API response with Zod
      const wompiDataResult = wompiApiResponseSchema.safeParse(wompiJson);

      if (!wompiDataResult.success) {
        console.error('❌ Invalid Wompi API response:', wompiDataResult.error);
        throw createError({
          statusCode: 500,
          message: 'Invalid transaction data from Wompi',
          data: wompiDataResult.error,
        });
      }

      const fullTxData = wompiDataResult.data.data;

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

      // Determine plan from amount
      const planMap: Record<number, string> = {
        2500000: 'emprendedor',
        5000000: 'negocio',
      };
      const plan = planMap[fullTxData.amount_in_cents] || 'emprendedor';

      // Handle based on transaction type
      if (isRenewal) {
        console.log('🔄 Processing renewal transaction');

        // Extract subscription_id from reference: RENEWAL-{sub_id}-{timestamp}
        const referenceParts = fullTxData.reference.split('-');
        const subId = parseInt(referenceParts[1]);

        // Get subscription and user info
        const [existingSub] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.id, subId))
          .limit(1);

        if (!existingSub) {
          console.error('❌ Subscription not found for renewal:', subId);
          throw createError({
            statusCode: 404,
            message: 'Subscription not found',
          });
        }

        await db.transaction(async (tx) => {
          // Save transaction
          await tx.insert(transactions).values({
            user_id: existingSub.user_id,
            subscription_id: subId,
            wompi_transaction_id: fullTxData.id,
            amount_in_cents: fullTxData.amount_in_cents,
            status: fullTxData.status,
            reference: fullTxData.reference,
            currency: 'COP',
          });
          console.log('💾 Renewal transaction saved');

          // Update subscription if payment approved
          if (fullTxData.status === 'APPROVED') {
            const now = new Date();
            const currentPeriodEnd = existingSub.current_period_end
              ? new Date(existingSub.current_period_end)
              : new Date(0);
            const isStillActive = currentPeriodEnd > now;

            let newPeriodStart: Date;
            let newPeriodEnd: Date;

            if (isStillActive) {
              // Extend from current period end (respeta tiempo pagado)
              newPeriodStart = currentPeriodEnd;
              newPeriodEnd = new Date(currentPeriodEnd);
              newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

              console.log(
                `📅 Extending renewal from ${currentPeriodEnd.toISOString()} to ${newPeriodEnd.toISOString()}`
              );
            } else {
              // Already expired, start from now
              newPeriodStart = now;
              newPeriodEnd = new Date(now);
              newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

              console.log(
                `📅 Starting new period from ${now.toISOString()} to ${newPeriodEnd.toISOString()}`
              );
            }

            await tx
              .update(subscriptions)
              .set({
                status: 'active',
                current_period_start: newPeriodStart.toISOString(),
                current_period_end: newPeriodEnd.toISOString(),
                cancel_at_period_end: 0, // Reset cancellation flag
                updated_at: now.toISOString(),
              })
              .where(eq(subscriptions.id, subId));

            console.log('🎉 Subscription renewed successfully');
          } else if (
            fullTxData.status === 'DECLINED' ||
            fullTxData.status === 'ERROR'
          ) {
            // Mark subscription as past_due if payment failed
            await tx
              .update(subscriptions)
              .set({
                status: 'past_due',
                updated_at: new Date().toISOString(),
              })
              .where(eq(subscriptions.id, subId));

            console.log(
              '❌ Renewal payment failed, subscription marked as past_due'
            );
          }
        });
      } else if (isInitialSub) {
        console.log('✨ Processing initial subscription');

        // Extract user_id from reference: SUB-{user_id_prefix}-{timestamp}
        const referenceParts = fullTxData.reference.split('-');
        const userIdPrefix = referenceParts[1];

        // Find user by matching user_id prefix
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

        const { data: users, error: usersError } =
          await supabaseAdmin.auth.admin.listUsers();

        if (usersError || !users) {
          console.error('❌ Error fetching users:', usersError);
          throw createError({ statusCode: 500, message: 'Error finding user' });
        }

        const user = users.users.find((u) => u.id.startsWith(userIdPrefix));

        if (!user) {
          console.error('❌ User not found for prefix:', userIdPrefix);
          throw createError({ statusCode: 404, message: 'User not found' });
        }

        console.log('👤 Found user:', user.email);

        // Save to database
        await db.transaction(async (tx) => {
          // Save payment source if it exists
          if (fullTxData.payment_method?.extra?.external_identifier) {
            const paymentSourceId =
              fullTxData.payment_method.extra.external_identifier;

            const [existing] = await tx
              .select()
              .from(paymentSources)
              .where(
                eq(paymentSources.wompi_payment_source_id, paymentSourceId)
              )
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

            if (existingSub) {
              // Check if existing subscription is still active
              const currentPeriodEnd = existingSub.current_period_end
                ? new Date(existingSub.current_period_end)
                : new Date(0);
              const isStillActive = currentPeriodEnd > now;

              let newPeriodStart: Date;
              let newPeriodEnd: Date;

              if (isStillActive) {
                // Extend from current period end (usuario ya pagó hasta esa fecha)
                newPeriodStart = currentPeriodEnd;
                newPeriodEnd = new Date(currentPeriodEnd);
                newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

                console.log(
                  `📅 Extending subscription from ${currentPeriodEnd.toISOString()} to ${newPeriodEnd.toISOString()}`
                );
              } else {
                // Already expired, start from now
                newPeriodStart = now;
                newPeriodEnd = new Date(now);
                newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

                console.log(
                  `📅 Starting new period from ${now.toISOString()} to ${newPeriodEnd.toISOString()}`
                );
              }

              await tx
                .update(subscriptions)
                .set({
                  plan,
                  status: 'active',
                  current_period_start: newPeriodStart.toISOString(),
                  current_period_end: newPeriodEnd.toISOString(),
                  cancel_at_period_end: 0, // Reset cancellation flag
                  updated_at: now.toISOString(),
                })
                .where(eq(subscriptions.id, existingSub.id));
              console.log('🔄 Subscription extended and cancellation cleared');
            } else {
              // New subscription
              const periodEnd = new Date(now);
              periodEnd.setMonth(periodEnd.getMonth() + 1);

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
            currency: 'COP',
          });
          console.log('💾 Transaction saved');
        });
      }

      console.log('✅ Webhook processed successfully');
    }

    return { received: true };
  } catch (error) {
    console.error('❌ Webhook error:', error);
    throw error;
  }
});
