<script setup lang="ts">
  const user = useSupabaseUser();

  const { data, pending, error, refresh } = await useFetch('/api/products', {
    key: 'products',
    immediate: !!user.value,
    watch: [user],
  });

  const { data: dashboardData, pending: dashboardPending } = await useFetch(
    '/api/dashboard/stats',
    {
      key: 'stats',
      immediate: !!user.value,
      watch: [user],
    }
  );

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
        <!-- Referencias Card -->
        <Card class="flex w-sm flex-row items-center justify-between">
          <div class="w-full">
            <CardContent class="text-2xl font-bold">
              <Skeleton v-if="pending" class="h-8 w-16" />
              <template v-else>{{ numProducts }}</template>
            </CardContent>
            <CardHeader>
              <CardTitle class="font-medium">Referencias</CardTitle>
            </CardHeader>
          </div>
          <CardFooter class="h-fit">
            <Package />
          </CardFooter>
        </Card>

        <!-- Marcas Card -->
        <Card class="flex w-sm flex-row items-center justify-between">
          <div class="w-full">
            <CardContent class="text-2xl font-bold">
              <Skeleton v-if="pending" class="h-8 w-16" />
              <template v-else>{{ numBrands }}</template>
            </CardContent>
            <CardHeader>
              <CardTitle class="font-medium">Marcas</CardTitle>
            </CardHeader>
          </div>
          <CardFooter class="h-fit">
            <Tags />
          </CardFooter>
        </Card>

        <!-- Productos en inventario Card -->
        <Card class="flex w-sm flex-row items-center justify-between">
          <div class="w-full">
            <CardContent class="text-2xl font-bold">
              <Skeleton v-if="dashboardPending" class="h-8 w-20" />
              <template v-else>
                {{ dashboardData?.stock }}
              </template>
            </CardContent>
            <CardHeader>
              <CardTitle class="font-medium">Productos en inventario</CardTitle>
            </CardHeader>
          </div>
          <CardFooter class="h-fit">
            <Warehouse />
          </CardFooter>
        </Card>

        <!-- Valor total Card -->
        <Card class="flex w-sm flex-row items-center justify-between">
          <div class="w-full">
            <CardContent class="text-2xl font-bold">
              <Skeleton v-if="dashboardPending" class="h-8 w-32" />
              <template v-else>
                {{
                  dashboardData?.value?.toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0,
                  })
                }}
              </template>
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
