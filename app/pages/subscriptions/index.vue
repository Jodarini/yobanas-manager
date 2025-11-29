<script setup lang="ts">
  const user = useSupabaseUser();
  const loading = ref(false);
  const selectedPlan = ref<'emprendedor' | 'negocio'>('emprendedor');

  const plans = [
    {
      id: 'emprendedor',
      name: 'Plan Emprendedor',
      price: 25000,
      features: [
        '500 productos',
        'Ventas ilimitadas',
        '90 días de historial',
        '50 imágenes',
        'Analíticas básicas',
      ],
    },
    {
      id: 'negocio',
      name: 'Plan Negocio',
      price: 50000,
      features: [
        'Productos ilimitados',
        'Ventas ilimitadas',
        'Historial ilimitado',
        '200 imágenes',
        'Analíticas avanzadas',
        'Alertas de stock',
        'Exportar a Excel',
      ],
    },
  ];

  const subscribeToPlan = async (planId: string) => {
    loading.value = true;

    try {
      const { data, error } = await useFetch(
        '/api/wompi/subscriptions/create-checkout-link',
        {
          method: 'POST',
          body: { planName: planId },
        }
      );

      if (error.value) {
        alert('Error al crear checkout: ' + error.value.message);
        return;
      }

      // Redirect to Wompi checkout
      window.location.href = data.value.checkoutUrl;
    } catch (err) {
      console.error(err);
      alert('Error inesperado');
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="container mx-auto py-8">
    <h1 class="mb-8 text-3xl font-bold">Elige tu plan</h1>

    <div class="grid gap-6 md:grid-cols-2">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="rounded-lg border p-6"
        :class="{ 'border-2 border-blue-500': selectedPlan === plan.id }"
      >
        <h2 class="mb-2 text-2xl font-bold">{{ plan.name }}</h2>
        <p class="mb-4 text-3xl font-bold">
          ${{ plan.price.toLocaleString('es-CO') }} COP
          <span class="text-sm font-normal text-gray-600">/mes</span>
        </p>

        <ul class="mb-6 space-y-2">
          <li
            v-for="feature in plan.features"
            :key="feature"
            class="flex items-center"
          >
            <span class="mr-2">✓</span>
            {{ feature }}
          </li>
        </ul>

        <Button
          :disabled="loading"
          class="w-full"
          @click="subscribeToPlan(plan.id)"
        >
          {{ loading ? 'Cargando...' : 'Suscribirse' }}
        </Button>
      </div>
    </div>
  </div>
</template>
