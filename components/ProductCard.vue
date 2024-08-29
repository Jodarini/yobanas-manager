<script setup lang="ts">
import type { Product } from "~/types/types";

const props = defineProps<{ product: Product }>();
</script>

<template>
  <NuxtLink :to="`/product/${product.id}`">
    <Card class="min-h-96 min-w-60 overflow-hidden">
      <CardHeader class="p-0">
        <AspectRatio :ratio="16 / 9">
          <img
            :src="product.thumbnail"
            :alt="product.title"
            class="h-full w-full object-cover"
          />
        </AspectRatio>
      </CardHeader>
      <CardContent class="p-4">
        <Badge v-for="category of product.category" class="mb-2">{{
          category
        }}</Badge>
        <h3 class="mb-2 text-lg font-semibold">{{ product.title }}</h3>
        <p class="text-sm text-muted-foreground">{{ product.description }}</p>
      </CardContent>
      <CardFooter class="flex items-center justify-between p-4">
        <span class="text-xl font-bold"
          >${{
            product.price.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          }}</span
        >
      </CardFooter>
    </Card>
  </NuxtLink>
</template>
