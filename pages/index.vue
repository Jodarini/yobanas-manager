<script setup lang="ts">
import { columns } from '@/components/columns';

const { data: filteredProducts, status: productsStatus, error: productsError, refresh } = await useFetch('/api/products', {
  key: "products",
  lazy: true
})
</script>

<template>
  <div>
    <div class="flex justify-between">
      <h1 class="mb-6 text-2xl">Productos</h1>
      <Button as-child>
        <NuxtLink to="add-product">Agregar producto</NuxtLink>
      </Button>
    </div>
    <p v-if="productsStatus === 'pending'">{{ productsStatus }}</p>
    <p v-else-if="productsError">{{ productsError }}</p>

    <div v-else-if="filteredProducts && filteredProducts.length > 0">
      <Card>
        <CardContent class="p-0 pt-0">
          <DataTable :columns="columns" :data="filteredProducts" />
        </CardContent>
      </Card>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      </div>
    </div>
    <div v-else>¡Agrega nuevos items a tu inventario!</div>

  </div>
</template>
