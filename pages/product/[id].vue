<script setup lang="ts">
const route = useRoute();
const store = useProductsStore();
const prod = await store.fetchProduct(+route.params.id);
const product = prod.data.value;
</script>

<template>
  <div v-if="product" class="flex">
    <AspectRatio :ratio="16 / 9">
      <NuxtImg
        :src="product.thumbnail!"
        :alt="product.title"
        class="h-full w-full object-contain"
      />
    </AspectRatio>
    <div class="flex flex-col gap-4">
      <h3 class="mb-2 text-lg font-semibold">{{ product.title }}</h3>
      <span class="">${{ product.price }}</span>
      <p>{{ product.description }}</p>
      <p><b>Marca: </b>{{ product.brand }}</p>
      <p><b>En stock: </b>{{ product.stock }}</p>
      <template v-for="tag in product.category" :key="`${tag}${product.id}`">
        <Badge variant="secondary" class="mb-2 w-fit">{{ tag }}</Badge>
      </template>
    </div>
  </div>
</template>
