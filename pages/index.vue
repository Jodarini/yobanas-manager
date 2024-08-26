<script setup lang="ts">
import ProductCard from "~/components/ProductCard.vue";

const store = useProductsStore();
const { status, error } = await store.fetchProducts();
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl">Your products</h1>
    <p v-if="status === 'pending'">{{ status }}</p>
    <p v-else-if="error">{{ error }}</p>
    <div
      v-else
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <ProductCard
        v-for="product in store.products"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>
