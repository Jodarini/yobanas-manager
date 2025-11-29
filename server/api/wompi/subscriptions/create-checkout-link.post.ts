// server/api/wompi/subscriptions/create-checkout-link.post.ts
import { serverSupabaseClient } from '#supabase/server';
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
    planName: string;
  }>(event);

  const plans = {
    emprendedor: { amount: 2500000, name: 'Plan Emprendedor' },
    negocio: { amount: 5000000, name: 'Plan Negocio' },
  };

  const selectedPlan = plans[body.planName];
  if (!selectedPlan) {
    throw createError({ statusCode: 400, message: 'Invalid plan' });
  }

  const reference = `SUB-${user.id.substring(0, 8)}-${Date.now()}`;
  const signatureString = `${reference}${selectedPlan.amount}COP${config.wompiIntegrityKey}`;
  const signature = crypto
    .createHash('sha256')
    .update(signatureString)
    .digest('hex');

  // Get base URL from env or default to localhost
  const appUrl = process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const baseUrl = 'https://checkout.wompi.co/p/';
  const params = [
    `public-key=${config.public.wompiPublic}`,
    `currency=COP`,
    `amount-in-cents=${selectedPlan.amount}`,
    `reference=${reference}`,
    `signature:integrity=${signature}`,
    `redirect-url=${encodeURIComponent(`${appUrl}/subscriptions/callback`)}`, // ADD THIS
  ].join('&');

  const checkoutUrl = `${baseUrl}?${params}`;

  return {
    checkoutUrl,
    reference,
  };
});
