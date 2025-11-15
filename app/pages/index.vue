<script setup lang="ts">
  const user = useSupabaseUser();

  const { data, pending, error, refresh } = await useFetch('/api/products', {
    key: 'products',
    immediate: !!user.value,
    // getCachedData(key) {
    //   return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key];
    // },
  });

  const { data: dashboardData } = await useFetch('/api/dashboard/stats', {
    key: 'stats',
    immediate: !!user.value,
    // getCachedData(key) {
    //   return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key];
    // },
  });

  const numProducts = computed(() => data.value?.length);

  const numBrands = computed(
    () => new Set(data.value?.map((product) => product.brand)).size
  );
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
      <h1 class="mb-6 text-2xl">Dashboard</h1>
      <div class="flex w-full flex-wrap gap-4">
        <Card class="flex w-sm flex-row items-center justify-between">
          <div class="w-full">
            <CardContent class="text-2xl font-bold">
              {{ numProducts }}
            </CardContent>
            <CardHeader>
              <CardTitle class="font-medium">Referencias</CardTitle>
            </CardHeader>
          </div>
          <CardFooter class="h-fit">
            <Package />
          </CardFooter>
        </Card>

        <Card class="flex w-sm flex-row items-center justify-between">
          <div class="w-full">
            <CardContent class="text-2xl font-bold">
              {{ numBrands }}
            </CardContent>
            <CardHeader>
              <CardTitle class="font-medium">Marcas</CardTitle>
            </CardHeader>
          </div>
          <CardFooter class="h-fit">
            <Tags />
          </CardFooter>
        </Card>

        <Card class="flex w-sm flex-row items-center justify-between">
          <div class="w-full">
            <CardContent class="text-2xl font-bold">
              {{ dashboardData?.stock }}
            </CardContent>
            <CardHeader>
              <CardTitle class="font-medium">Productos en inventario</CardTitle>
            </CardHeader>
          </div>
          <CardFooter class="h-fit">
            <Warehouse />
          </CardFooter>
        </Card>
        <Card class="flex w-sm flex-row items-center justify-between">
          <div class="w-full">
            <CardContent class="text-2xl font-bold">
              {{
                dashboardData?.value?.toLocaleString('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                })
              }}
            </CardContent>
            <CardHeader>
              <CardTitle class="font-medium">Valor total</CardTitle>
            </CardHeader>
          </div>
          <CardFooter class="h-fit">
            <DollarSign />
          </CardFooter>
        </Card>
      </div>
    </template>
  </div>
</template>
