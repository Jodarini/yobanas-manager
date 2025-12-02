<!-- pages/subscription/callback.vue -->
<script setup lang="ts">
  const route = useRoute();
  const router = useRouter();
  const loading = ref(true);
  const success = ref(false);
  const message = ref('');
  const errorDetails = ref('');

  onMounted(async () => {
    const transactionId = route.query.id as string;

    if (!transactionId) {
      message.value = 'No se encontró información de la transacción';
      loading.value = false;
      return;
    }

    try {
      const response = await $fetch('/api/wompi/subscriptions/verify-payment', {
        method: 'POST',
        body: { transactionId },
      });

      if (response?.status === 'APPROVED') {
        message.value = '¡Suscripción activada exitosamente!';
        success.value = true;

        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        message.value = 'El pago no fue aprobado.';
        errorDetails.value = `Status: ${response?.status || 'unknown'}`;
        success.value = false;
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      message.value = 'Error al verificar el pago';
      errorDetails.value =
        err.data?.message || err.message || JSON.stringify(err);
      success.value = false;
    } finally {
      loading.value = false;
    }
  });
</script>

<template>
  <div class="container mx-auto py-16 text-center">
    <div v-if="loading">
      <h1 class="mb-4 text-2xl">Verificando tu pago...</h1>
      <p>Por favor espera un momento</p>
    </div>

    <div v-else-if="success" class="text-green-600">
      <h1 class="mb-4 text-3xl font-bold">✓ {{ message }}</h1>
      <p>Serás redirigido al dashboard...</p>
    </div>

    <div v-else class="text-red-600">
      <h1 class="mb-4 text-3xl font-bold">✗ {{ message }}</h1>
      <details class="mx-auto mt-4 max-w-2xl text-left">
        <summary class="cursor-pointer">Ver detalles del error</summary>
        <pre class="mt-2 overflow-auto rounded bg-gray-100 p-4 text-sm">{{
          errorDetails
        }}</pre>
      </details>
      <Button class="mt-4" @click="router.push('/subscription')">
        Intentar de nuevo
      </Button>
    </div>
  </div>
</template>
