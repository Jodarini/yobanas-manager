<script setup lang="ts">
import { AspectRatio } from "@/components/ui/aspect-ratio";
interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  images: string[];
}

interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

const {
  data: productsResponse,
  status,
  error,
} = await useFetch<ProductsResponse>("https://dummyjson.com/products");

const products = ref<Product[]>(productsResponse.value?.products ?? []);
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl">Your products</h1>
    <p v-if="status === 'pending'">{{ status }}</p>
    <p v-else-if="error">{{ error }}</p>
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <Card
        v-for="product in products"
        :key="product.id"
        class="overflow-hidden"
      >
        <CardHeader class="p-0">
          <div class="aspect-w-4 aspect-h-3">
            <img
              :src="product.images[0]"
              :alt="product.title"
              class="object-cover w-full h-full"
            />
          </div>
        </CardHeader>
        <CardContent class="p-4">
          <Badge class="mb-2">{{ product.category }}</Badge>
          <h3 class="text-lg font-semibold mb-2">{{ product.title }}</h3>
          <!-- <p class="text-sm text-muted-foreground">{{ product.description }}</p> -->
        </CardContent>
        <CardFooter class="flex justify-between items-center p-4">
          <span class="text-xl font-bold">${{ product.price.toFixed(2) }}</span>
          <Button>Add to Cart</Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
