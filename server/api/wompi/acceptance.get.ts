export default defineEventHandler(async () => {
  const config = useRuntimeConfig();

  const res = await fetch(
    `https://sandbox.wompi.co/v1/merchants/${config.public.wompiPublic}`
  );
  if (!res.ok)
    throw createError({
      statusCode: res.status,
      statusMessage: await res.text(),
    });

  const data = await res.json();
  const theData = data.data;
  const presigned = data.data.presigned_acceptance;
  const personalDataToken =
    data.data.presigned_personal_data_auth.acceptance_token;

  return {
    presigned,
    personalDataToken,
  };
});
