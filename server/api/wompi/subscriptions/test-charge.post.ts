export default defineEventHandler(async (event) => {
  const { data, error } = await $fetch('/api/wompi/subscriptions/charge', {
    method: 'POST',
    body: {
      amountInCents: 4990000, // 49,900 COP (ends in 00 = approved)
      reference: `SUB-${Date.now()}`, // Unique reference per charge
    },
  });

  return { data, error };
});
