<script setup lang="ts">
const route = useRoute();
const store = useProductsStore();
const prod = await store.fetchProduct(+route.params.id);
const product = prod.data.value;
console.log({ product })
</script>

<template>
  <div v-if="product" class="flex w-full gap-2">
    <NuxtImg :src="product.products.thumbnail!" :alt="product.products.title" class="h-full max-w-lg object-contain" />
    <div class="flex flex-col gap-4">
      <h3 class="mb-2 text-4xl font-semibold">{{ product.products.title }}</h3>
      <span class="">${{ product.products.price }}</span>
      <p>{{ product.products.description }}</p>
      <p><b>Marca: </b>{{ product.products.brand }}</p>
      <!-- <p><b>En stock: </b>{{ product.stock }}</p> -->
      <div class="flex gap-2">
        <template v-for="tag in product.products.category" :key="`${tag}${product.id}`">
          <Badge variant="secondary" class="flex gap-2 mb-2 w-fit">{{ tag }}</Badge>
        </template>
      </div>
      <div>
        <!-- <template v-for="color in product.product_variants.color"></template> -->
      </div>

      < {{ product.product_variants.color }} {{ product.product_variants.stock }} </div>
    </div>
</template>
