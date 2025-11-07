<script setup lang="ts">
  const { data } = await useFetch('/api/products', {
    key: 'products',
  });

  const categories = ref<string[]>([
    ...new Set(data.value?.flatMap((product) => product.category)),
  ]);
  const brands = ref<string[]>([
    ...new Set(data.value?.map((product) => product.brand)),
  ]);
</script>

<template>
  <ProductForm mode="ADD" :brands :categories />
</template>
