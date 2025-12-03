<script setup lang="ts">
  import { useToast } from '~/components/ui/toast';
  import { CalendarDays } from 'lucide-vue-next';

  const data = useUserSubscription();
  const loading = ref(false);
  const { toast } = useToast();
  const user = useSupabaseUser();

  const { data: subscription } = await useFetch('/api/subscriptions/current');

  const cancelSubscription = async (immediately = false) => {
    const confirmed = confirm(
      immediately
        ? '¿Estás seguro? Perderás acceso a las funciones premium inmediatamente.'
        : '¿Cancelar al final del período? Seguirás teniendo acceso hasta el final del mes actual.'
    );

    if (!confirmed) return;

    try {
      const { data, error } = await useFetch('/api/subscriptions/cancel', {
        method: 'POST',
        body: { immediately },
      });

      if (error.value) {
        toast({
          variant: 'destructive',
          title: 'Error al cancelar la suscripción',
          description: `${error.value.data?.message}`,
        });
      } else {
        toast({
          title: 'Subscipción cancelada exitosamente',
          description: `${data.value.message}`,
        });
        refreshNuxtData('subscription');
      }
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error al cancelar la suscripción',
        description: `${e.message}`,
      });
    }
  };

  const plans = [
    {
      id: 'emprendedor',
      name: 'Plan Emprendedor',
      price: 25000,
      features: [
        '500 productos',
        'Ventas ilimitadas',
        '90 días de historial',
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
  const formateador = new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
</script>

<template>
  <div class="container mx-auto py-8">
    <!-- <pre>{{ user }}</pre> -->
    <!-- <pre>{{ subscription }}</pre> -->
    <div v-if="subscription">
      <template v-if="user">
        <p class="text-xl font-bold">
          {{ user.email }}
        </p>
        <Badge>
          {{ `Plan ${subscription.plan}` }}
        </Badge>

        <section class="mt-2">
          <h3 class="mb-2 text-2xl font-bold">Tu suscripción</h3>
          <Separator />
          <div class="flex flex-col gap-4 py-2 md:flex-row md:justify-between">
            <div>
              <p>
                Gracias por suscribirte a
                <span class="font-bold">Plan {{ subscription.plan }}!</span>
              </p>
              <div class="flex flex-row items-center gap-1">
                <CalendarDays size="1rem" />
                <p>
                  Tu servicio terminará el
                  {{
                    formateador.format(
                      new Date(subscription.current_period_end)
                    )
                  }}.
                </p>
              </div>

              <p class="text-destructive-foreground">
                Tu suscripción se cancelará el
                {{
                  formateador.format(new Date(subscription.current_period_end))
                }}
              </p>
            </div>

            <div
              v-if="subscription.cancel_at_period_end"
              class="flex flex-col gap-2"
            >
              <Button variant="outline" @click="cancelSubscription(true)">
                Cancelar inmediatamente
              </Button>
              <!-- Option to undo cancellation -->
              <Button variant="outline" @click="undoCancel">
                Reactivar suscripción
              </Button>
            </div>

            <div v-else class="flex flex-col gap-2">
              <Button variant="outline" @click="cancelSubscription(false)">
                Cancelar al final del período
              </Button>
              <Button variant="outline" @click="cancelSubscription(true)">
                Cancelar inmediatamente
              </Button>
            </div>
          </div>
        </section>
      </template>
    </div>
    <h1 class="mb-2 text-3xl font-bold">Planes</h1>

    <div class="grid gap-6 md:grid-cols-2">
      <div
        v-for="plan in plans"
        :key="plan.id"
        Tu
        plani
        class="rounded-lg border p-6"
      >
        <Badge
          v-if="data.planName.value === plan.name"
          class="bg-foreground/20 mb-2"
        >
          Tu plan actual
        </Badge>
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
          :disabled="loading || subscription || (user && user.is_anonymous)"
          class="w-full"
          @click="subscribeToPlan(plan.id)"
        >
          {{ loading ? 'Cargando...' : 'Suscribirse' }}
        </Button>
      </div>
    </div>
  </div>
</template>
