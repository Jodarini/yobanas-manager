<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import type { Product } from '~~/db/schema'

const searchTerm = ref('')
const debouncedSearchTerm = refDebounced(searchTerm, 500) // 300ms debounce
const selectedProduct = ref<Product>()
const selectedProductId = computed(() => selectedProduct.value?.id)


const { data, pending, error, refresh } =
  useFetch(() => `/api/products?search=${debouncedSearchTerm.value}`, {
    watch: [debouncedSearchTerm],
    lazy: true,
  })

const { data: variants, pending: variantsPending } = useFetch(
  () => `/api/product/${selectedProductId.value}/variants`,
  {
    watch: [selectedProductId],
    lazy: true, // Use lazy instead of immediate: false
  }
)

watch(data, () =>
  selectedProduct.value = data.value[0]
)
</script>

<template>
  <Card>
    <CardHeader class="border-b">
      <CardTitle>Agregar venta</CardTitle>
      <CardDescription>Agregar una venta a tu inventario</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex flex-row gap-4">
        <div class="flex flex-col gap-4 max-w-1/3 border-r pr-4">
          <Input placeholder="Buscar producto..." v-model="searchTerm" />
          <div v-for="product in data" @click="selectedProduct = product">
            {{ product.title }}
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <h2 class="text-2xl">{{ selectedProduct?.title }}</h2>
          <div v-for="variant in variants" :key="variant.id">
            {{ variant.size }}
            {{ variant.color }}
            {{ variant.stock }}
          </div>
        </div>
      </div>

    </CardContent>
  </Card>
</template>
