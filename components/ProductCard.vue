<script setup lang="ts">
interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  images: string[];
}
defineProps<{ product: Product }>();
</script>

<template>
  <Card class="overflow-hidden">
    <CardHeader class="p-0">
      <AspectRatio :ratio="16 / 9">
        <img
          :src="product.images[0]"
          :alt="product.title"
          class="object-contain w-full h-full"
        />
      </AspectRatio>
    </CardHeader>
    <CardContent class="p-4">
      <Badge class="mb-2">{{ product.category }}</Badge>
      <h3 class="text-lg font-semibold mb-2">{{ product.title }}</h3>
      <!-- <p class="text-sm text-muted-foreground">{{ product.description }}</p> -->
    </CardContent>
    <CardFooter class="flex justify-between items-center p-4">
      <span class="text-xl font-bold">${{ product.price.toFixed(2) }}</span>
    </CardFooter>
  </Card>
</template>
