<script setup lang="ts">
  import type { ProductWithVariants } from '~~/db/schema';

  const props = defineProps<{
    product: ProductWithVariants;
  }>();

  const productData = props.product;

  const { data } = await useFetch('/api/products', {
    key: 'products',
  });

  const categories = computed(() => {
    const cats = data.value?.flatMap((product) => product.category);
    return [...new Set(cats)].sort();
  });

  const brands = computed(() => {
    if (!data.value) return [];
    return [...new Set(data.value.map((product) => product.brand))].sort();
  });
</script>

<template>
  <ProductForm mode="EDIT" :brands :categories :initial-values="productData" />
</template>
