<script setup lang="ts">
  import { columns } from '@/components/columns';
  import { useToast } from '@/components/ui/toast/use-toast';

  const { toast } = useToast();
  const user = useSupabaseUser();

  const { data, status, error, execute } = await useFetch('/api/products', {
    key: 'products',
    immediate: false,
  });

  watch(user, async (newUser) => {
    if (newUser) {
      await execute();
    }
  });

  if (error.value) {
    toast({
      variant: 'destructive',
      title: error.value.message,
    });
  }
</script>

<template>
  <div>
    <template v-if="!user">
      <h1 class="mb-6 text-2xl">Bienvenido!</h1>
      <p>Inicia sesión para comenzar a crear productos.</p>
      <Button as-child>
        <NuxtLink to="/login">Iniciar sesión</NuxtLink>
      </Button>
    </template>
    <template v-else-if="user">
      <div class="flex justify-between">
        <h1 class="mb-6 text-2xl">Sus productos</h1>
        <Button as-child>
          <NuxtLink to="add-product">Agregar producto</NuxtLink>
        </Button>
      </div>

      <div
        v-if="status === 'pending'"
        class="flex min-h-[400px] items-center justify-center"
      >
        <div class="flex flex-col items-center gap-4">
          <div
            class="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"
          />
          <p class="text-gray-600">Cargando producto...</p>
        </div>
      </div>
      <p v-else-if="error">{{ error }}</p>

      <template v-else-if="data && data.length > 0">
        <Card>
          <CardContent class="p-0 pt-0">
            <DataTable :columns="columns" :data="data" />
          </CardContent>
        </Card>
      </template>
      <div v-else>¡Agrega nuevos items a tu inventario!</div>
    </template>
  </div>
</template>
