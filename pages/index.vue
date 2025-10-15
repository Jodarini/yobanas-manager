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
      <NuxtLink to="add-product">Agregar Producto</NuxtLink>
    </div>
    <p v-if="productsStatus === 'pending'">{{ productsStatus }}</p>
    <p v-else-if="productsError">{{ productsError }}</p>

    <div v-else-if="filteredProducts && filteredProducts.length > 0">
      <DataTable :columns="columns" :data="filteredProducts" />
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      </div>
    </div>
    <div v-else>¡Agrega nuevos items a tu inventario!</div>

  </div>
</template>
