<script setup lang="ts">
  import { useToast } from '~/components/ui/toast';

  const { toast } = useToast();
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
</script>

<template>
  <pre
    >{{ subscription }}
  </pre>
  <div v-if="subscription">
    <h2>Plan actual: {{ subscription.plan }}</h2>
    <p>
      Renovación:
      {{ new Date(subscription.current_period_end).toLocaleDateString() }}
    </p>

    <div v-if="subscription.cancel_at_period_end">
      <p class="text-orange-600">
        Tu suscripción se cancelará el
        {{ new Date(subscription.current_period_end).toLocaleDateString() }}
      </p>

      <Button @click="cancelSubscription(true)">Cancelar inmediatamente</Button>
      <!-- Option to undo cancellation -->
      <Button @click="undoCancel">Reactivar suscripción</Button>
    </div>

    <div v-else>
      <Button @click="cancelSubscription(false)">
        Cancelar al final del período
      </Button>
      <Button @click="cancelSubscription(true)">Cancelar inmediatamente</Button>
    </div>
  </div>
</template>
