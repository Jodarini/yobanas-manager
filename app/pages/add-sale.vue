<script setup lang="ts">
import { refDebounced } from '@vueuse/core'

const searchTerm = ref('')
const debouncedSearchTerm = refDebounced(searchTerm, 500) // 300ms debounce

const { data, pending, error, refresh } =
  useFetch(() => `/api/products?search=${debouncedSearchTerm.value}`, {
    watch: [debouncedSearchTerm],
    // lazy: true,
  })
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Agregar venta</CardTitle>
      <CardDescription>Agregar una venta a tu inventario</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex flex-col gap-4">
        <Input placeholder="Buscar producto..." v-model="searchTerm" />
        <div v-for="product in data">
          {{ product.title }}
        </div>
      </div>

    </CardContent>
  </Card>
</template>
