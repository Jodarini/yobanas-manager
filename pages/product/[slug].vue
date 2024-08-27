<script setup lang="ts">
import type { Product } from "~/types/types";

const route = useRoute();
const {
  data: productResponse,
  status,
  error,
} = await useFetch<Product>(
  `https://dummyjson.com/products/${route.params.slug}`,
);
const product = productResponse.value;
</script>

<template>
  <Card class="min-h-96 min-w-96 overflow-hidden" v-if="product">
    <CardHeader class="p-0">
      <AspectRatio :ratio="16 / 9">
        <img
          :src="product.images[0]"
          :alt="product.title"
          class="h-full w-full object-contain"
        />
      </AspectRatio>
    </CardHeader>
    <CardContent class="p-4">
      <template v-for="tag in product.tags">
        <Badge class="mb-2">{{ tag }}</Badge>
      </template>
      <h3 class="mb-2 text-lg font-semibold">{{ product.title }}</h3>
      <p>{{ product.description }}</p>
      <p><b>Marca: </b>{{ product.brand }}</p>
      <p><b>En stock: </b>{{ product.stock }}</p>
    </CardContent>
    <CardFooter class="flex items-center justify-between p-4">
      <span class="text-xl font-bold"
        >Precio: ${{ product.price.toFixed(2) }}</span
      >
    </CardFooter>
  </Card>
</template>
