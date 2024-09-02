<script setup lang="ts">
const route = useRoute();
const store = useProductsStore();
const prod = await store.fetchProduct(+route.params.id);
const product = prod.data.value;
</script>

<template>
  <Card v-if="product" class="min-h-96 min-w-96 overflow-hidden">
    <CardHeader class="p-0">
      <AspectRatio :ratio="16 / 9">
        <NuxtImg
          :src="product.thumbnail!"
          :alt="product.title"
          class="h-full w-full object-contain"
        />
      </AspectRatio>
    </CardHeader>
    <CardContent class="p-4">
      <template v-for="tag in product.tags" :key="`${tag}${product.id}`">
        <Badge class="mb-2">{{ tag }}</Badge>
      </template>
      <h3 class="mb-2 text-lg font-semibold">{{ product.title }}</h3>
      <p>{{ product.description }}</p>
      <p><b>Marca: </b>{{ product.brand }}</p>
      <p><b>En stock: </b>{{ product.stock }}</p>
    </CardContent>
    <CardFooter class="flex items-center justify-between p-4">
      <span class="text-xl font-bold"> Precio: ${{ product.price }}</span>
    </CardFooter>
  </Card>
</template>
