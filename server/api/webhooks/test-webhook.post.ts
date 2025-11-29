// server/api/test-webhook.post.ts
export default defineEventHandler(async (event) => {
  console.log('🔥 TEST WEBHOOK HIT');
  return { success: true };
});
