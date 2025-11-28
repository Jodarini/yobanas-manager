export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody<{
    sessionId: string;
    deviceId: string;
    fullName?: string;
    phoneNumber?: string;
    type: 'CARD' | 'NEQUI' | 'DAVIPLATA' | 'BANCOLOMBIA_TRANSFER';
    token: string;
    customerEmail: string;
    acceptanceToken: string;
    acceptPersonalAuth?: string;
  }>(event);

  const wompiPayload = {
    session_id: body.sessionId,
    customer_data: {
      device_id: body.deviceId,
      ...(body.fullName ? { full_name: body.fullName } : {}),
      ...(body.phoneNumber ? { phone_number: body.phoneNumber } : {}),
    },
    type: body.type,
    token: body.token,
    customer_email: body.customerEmail,
    acceptance_token: body.acceptanceToken,
    accept_personal_auth: body.acceptPersonalAuth || '',
  };

  const res = await fetch('https://sandbox.wompi.co/v1/payment_sources', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.wompiPrivateKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(wompiPayload),
  });

  if (!res.ok) {
    throw createError({
      statusCode: res.status,
      statusMessage: await res.text(),
    });
  }

  const data = await res.json();
  return {
    id: data.data.id,
    status: data.data.status,
    type: data.data.type,
    publicData: data.data.public_data,
  };
});
