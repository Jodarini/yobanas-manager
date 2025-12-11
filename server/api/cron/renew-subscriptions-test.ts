export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 403,
      message: 'Test endpoint not available in production',
    });
  }

  console.log('🧪 TEST MODE: Running cron job manually');
  console.log('🔍 Cron secret from config:', config.cronSecret);
  console.log('🔍 Expected auth header:', `Bearer ${config.cronSecret}`);

  const mockAuth = `Bearer ${config.cronSecret}`;
  console.log('🔍 Setting header to:', mockAuth);

  event.node.req.headers['authorization'] = mockAuth;

  const { default: renewSubscriptions } = await import(
    './process-renewals.post'
  );

  // Execute it
  return await renewSubscriptions(event);
});
