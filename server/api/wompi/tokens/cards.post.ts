// server/api/wompi/tokens/cards.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody<{
    number: string;
    exp_month: string;
    exp_year: string;
    cvc: string;
    card_holder: string;
  }>(event);

  const res = await fetch('https://sandbox.wompi.co/v1/tokens/cards', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.public.wompiPublic}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok)
    throw createError({
      statusCode: res.status,
      statusMessage: await res.text(),
    });

  const data = await res.json();
  return { tokenId: data.data.id };
});
