<script setup lang="ts">
  import type { ProductWithVariants } from '~~/db/schema';

  const route = useRoute();

  const {
    data: productData,
    status: productStatus,
    error: productError,
    refresh: refreshProduct,
  } = await useFetch<ProductWithVariants>(`/api/product/${route.params.id}`, {
    key: `product-${route.params.id}`,
  });
</script>

<template>
  <div
    v-if="productStatus === 'pending'"
    class="flex min-h-[400px] items-center justify-center"
  >
    <div class="flex flex-col items-center gap-4">
      <div
        class="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"
      />
      <p class="text-gray-600">Cargando producto...</p>
    </div>
  </div>

  <!-- Error State -->
  <div
    v-else-if="productError"
    class="flex min-h-[400px] flex-col items-center justify-center gap-4"
    style="bottom: 0"
  >
    <div class="text-center text-red-500">
      <h2 class="mb-2 text-2xl font-bold">Error al cargar el producto</h2>
      <p class="mb-4 text-gray-600">
        {{ productError.message || 'Ha ocurrido un error inesperado' }}
      </p>
      <Button variant="outline" @click="refreshProduct">
        Intentar de nuevo
      </Button>
    </div>
  </div>

  <!-- Product Not Found -->
  <div
    v-else-if="!productData"
    class="flex min-h-[400px] flex-col items-center justify-center"
  >
    <h2 class="mb-4 text-2xl font-bold text-gray-800">
      Producto no encontrado
    </h2>
    <p class="mb-4 text-gray-600">
      El producto que buscas no existe o ha sido eliminado.
    </p>
    <NuxtLink to="/">
      <Button variant="outline">Ver todos los productos</Button>
    </NuxtLink>
    <Button variant="outline" @click="refreshProduct">Intentar de nuevo</Button>
  </div>

  <div v-else-if="productData" class="flex w-full flex-col gap-6 md:flex-row">
    <EditProductForm :product="productData" />
  </div>
</template>
