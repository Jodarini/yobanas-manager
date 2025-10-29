<script setup lang="ts">
import { refDebounced } from '@vueuse/core'

const searchTerm = ref('')
const debouncedSearchTerm = refDebounced(searchTerm, 500) // 300ms debounce

const { data, pending, error, refresh } = await useFetch('', {
  watch: debouncedSearchTerm,
  lazy: true,
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
        {{ searchTerm }}
        {{ debouncedSearchTerm }}
      </div>

    </CardContent>
  </Card>
</template>
