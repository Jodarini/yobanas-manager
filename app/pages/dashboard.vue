<script setup lang="ts">
import { Tags, Package, DollarSign, Warehouse } from 'lucide-vue-next';

const { data, pending, error, refresh } = await useFetch('/api/products', {
  key: 'products'
})

const { data: dashboardData } = await useFetch('/api/dashboard/stats', {
  key: 'stockValue'
})

const numProducts = computed(() => data.value.length)

const numBrands = computed(() => new Set(data.value?.map(product => product.brand)).size)

// const stockValue = computed(() => data.value.reduce((acc, product) => acc + product.price, 0))

</script>

<template>
  <h1 class="mb-6 text-2xl">Dashboard</h1>
  <div class="flex gap-4 w-full flex-wrap">
    <Card class="w-sm flex flex-row justify-between items-center">
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

    <Card class="w-sm flex flex-row justify-between items-center">
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

    <Card class="w-sm flex flex-row justify-between items-center">
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
    <Card class="w-sm flex flex-row justify-between items-center">
      <div class="w-full">
        <CardContent class="text-2xl font-bold">
          {{ dashboardData?.value?.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
          }) }}
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
