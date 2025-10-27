<script setup lang="ts">
import { Tags, Package, DollarSign } from 'lucide-vue-next';

const { data, pending, error, refresh } = await useFetch('/api/products', {
  key: 'products'
})

const numProducts = computed(() => data.value.length)

const numBrands = computed(() => new Set(data.value?.map(product => product.brand)).size)

const stockValue = computed(() => data.value.reduce((acc, product) => acc + product.price, 0))

</script>

<template>
  <h1>Dashboard</h1>
  <div class="flex gap-4 w-full flex-wrap">
    <Card class="w-sm flex flex-row justify-between items-center">
      <div>
        <CardContent class="text-2xl font-bold">
          {{ numProducts }}
        </CardContent>
        <CardHeader>
          <CardTitle class="font-medium">Total productos</CardTitle>
        </CardHeader>
      </div>
      <CardFooter class="h-fit">
        <Package />
      </CardFooter>
    </Card>

    <Card class="w-sm flex flex-row justify-between items-center">
      <div>
        <CardContent class="text-2xl font-bold">
          {{ numBrands }}
        </CardContent>
        <CardHeader>
          <CardTitle class="font-medium">Total marcas</CardTitle>
        </CardHeader>
      </div>
      <CardFooter class="h-fit">
        <Tags />
      </CardFooter>
    </Card>

    <Card class="w-sm flex flex-row justify-between items-center">
      <div>
        <CardContent class="text-2xl font-bold">
          {{ stockValue }}
        </CardContent>
        <CardHeader>
          <CardTitle class="font-medium">Valor stock</CardTitle>
        </CardHeader>
      </div>
      <CardFooter class="h-fit">
        <DollarSign />
      </CardFooter>
    </Card>
  </div>
</template>
