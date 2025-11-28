<script setup lang="ts">
  const sessionId = ref<string | null>(null);
  const deviceId = ref<string | null>(null);
  const wompiReady = ref(false);
  const acceptanceToken = ref(undefined);

  onMounted(() => {
    const check = () => {
      if (typeof window !== 'undefined' && (window as any).$wompi) {
        wompiReady.value = true;
        (window as any).$wompi.initialize((data: any, error: any) => {
          if (!error) {
            sessionId.value = data.sessionId;
            deviceId.value = data.deviceData.deviceID;
            console.log('Wompi sessionId', sessionId.value);
            console.log('Wompi deviceId', deviceId.value);
          } else {
            console.error('Wompi init error', error);
          }
        });
      } else {
        setTimeout(check, 200);
      }
    };
    check();
  });

  const cardNumber = ref('4242424242424242');
  const exp_month = ref('06');
  const exp_year = ref('29');
  const cvc = ref('123');
  const cardHolder = ref('Pedro Pérez');

  const createPaymentSourceFlow = async () => {
    if (!sessionId.value) {
      console.error('No sessionId yet');
      return;
    }

    // 1) Tokenizar tarjeta
    const { data: tokenData, error: tokenErr } = await useFetch(
      '/api/wompi/tokens/cards',
      {
        method: 'POST',
        body: {
          number: cardNumber.value,
          exp_month: exp_month.value,
          exp_year: exp_year.value,
          cvc: cvc.value,
          card_holder: cardHolder.value,
        },
      }
    );
    if (tokenErr.value) {
      console.error(tokenErr.value);
      return;
    }
    const tokenId = tokenData.value!.tokenId;
    console.log('Card token:', tokenId);

    // 2) Obtener acceptance tokens
    const { data: accData, error: accErr } = await useFetch(
      '/api/wompi/acceptance',
      {
        method: 'GET',
      }
    );
    if (accErr.value) {
      console.error(accErr.value);
      return;
    }
    console.log('Acceptance token:', accData.value.presigned.acceptance_token);
    console.log('accept personal auth', accData.value.personalDataToken);

    // 3) Crear fuente de pago
    const { data: psData, error: psErr } = await useFetch(
      '/api/wompi/payment-sources',
      {
        method: 'POST',
        body: {
          sessionId: sessionId.value,
          deviceId: deviceId.value,
          fullName: cardHolder.value, // or get from a separate user profile field
          phoneNumber: undefined, // optional
          type: 'CARD',
          token: tokenId,
          customerEmail: 'user@example.com', // replace with real logged-in user email
          acceptanceToken: accData.value!.presigned.acceptance_token,
          acceptPersonalAuth: accData.value!.personalDataToken || '',
        },
      }
    );

    if (psErr.value) {
      console.error('Error creating payment source:', psErr.value);
      return;
    }

    console.log('✅ Fuente de pago creada:', psData.value);
    alert(`Payment source created! ID: ${psData.value.id}`);
    if (psData.value.id) {
      const { data: saved, error: dbError } = await useFetch(
        '/api/wompi/payment-sources/save',
        {
          method: 'POST',
          body: {
            wompiPaymentSourceId: psData.value!.id,
            type: psData.value!.type,
            status: psData.value!.status,
            cardBrand: psData.value!.public_data?.brand,
            cardLastFour: psData.value!.public_data?.last_four,
            phoneNumber: psData.value!.public_data?.phone_number,
          },
        }
      );
      console.log('✅ Saved to database:', saved);
    }
  };
  const permalink1 =
    'https://wompi.com/assets/downloadble/reglamento-Usuarios-Colombia.pdf';
  const permalink2 =
    'https://wompi.com/assets/downloadble/autorizacion-tratamiento-datos-personales.pdf';
</script>

<template>
  <div>
    <div class="w-full max-w-md">
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Método de pago</FieldLegend>
            <FieldDescription>
              Todas las transacciones son seguras y encriptadas
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel for="checkout-7j9-card-name-43j">
                  Nombre en tarjeta
                </FieldLabel>
                <Input
                  id="checkout-7j9-card-name-43j"
                  v-model="cardHolder"
                  placeholder="Evil Rabbit"
                  required
                />
              </Field>
              <Field>
                <FieldLabel for="checkout-7j9-card-number-uw1">
                  Número de tarjeta
                </FieldLabel>
                <Input
                  id="checkout-7j9-card-number-uw1"
                  v-model="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <FieldDescription>
                  Ingrese su número de tarjeta de 16 dígitos
                </FieldDescription>
              </Field>
              <div class="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel for="checkout-exp-month-ts6">Mes</FieldLabel>
                  <Select v-model="exp_month" default-value="">
                    <SelectTrigger id="checkout-exp-month-ts6">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">01</SelectItem>
                      <SelectItem value="02">02</SelectItem>
                      <SelectItem value="03">03</SelectItem>
                      <SelectItem value="04">04</SelectItem>
                      <SelectItem value="05">05</SelectItem>
                      <SelectItem value="06">06</SelectItem>
                      <SelectItem value="07">07</SelectItem>
                      <SelectItem value="08">08</SelectItem>
                      <SelectItem value="09">09</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="11">11</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel for="checkout-7j9-exp-year-f59">Año</FieldLabel>
                  <Select v-model="exp_year" default-value="">
                    <SelectTrigger id="checkout-7j9-exp-year-f59">
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">2024</SelectItem>
                      <SelectItem value="25">2025</SelectItem>
                      <SelectItem value="26">2026</SelectItem>
                      <SelectItem value="27">2027</SelectItem>
                      <SelectItem value="28">2028</SelectItem>
                      <SelectItem value="29">2029</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel for="checkout-7j9-cvv">CVV</FieldLabel>
                  <Input
                    id="checkout-7j9-cvv"
                    v-model="cvc"
                    placeholder="123"
                    required
                  />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox
                  id="checkout-7j9-same-as-shipping-wgm"
                  :default-value="false"
                />
                <FieldLabel
                  for="checkout-7j9-same-as-shipping-wgm"
                  class="font-normal"
                >
                  He leido y acepto los
                  <NuxtLink
                    :to="permalink1"
                    target="_blank"
                    class="text-accent-foreground"
                  >
                    términos y condiciones de Wompi.
                  </NuxtLink>
                </FieldLabel>
              </Field>

              <Field orientation="horizontal">
                <Checkbox
                  id="checkout-7j9-same-as-shipping-wgm"
                  :default-value="false"
                />
                <FieldLabel
                  for="checkout-7j9-same-as-shipping-wgm"
                  class="font-normal"
                >
                  <NuxtLink :to="permalink2" target="_blank">
                    Ver términos y condiciones 2
                  </NuxtLink>
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button
              type="submit"
              :disabled="!wompiReady || !sessionId"
              @click.prevent="createPaymentSourceFlow"
            >
              Crear fuente de pago
            </Button>
            <Button variant="outline" type="button">Cancel</Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  </div>
</template>
