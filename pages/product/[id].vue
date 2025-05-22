<script setup lang="ts">
const route = useRoute();
const store = useProductsStore();
const prod = await store.fetchProduct(+route.params.id);
const product = prod.data.value;
</script>

<template>
  <div v-if="product" class="flex w-full gap-6">
    <NuxtImg :src="product.productInfo.thumbnail!" :alt="product.productInfo.title"
      class="h-full max-w-lg object-contain rounded-md" />
    <div class="flex flex-col gap-4 max-w-lg">
      <div>
        <h3 class="mb-2 text-4xl font-semibold">{{ product.productInfo.title }}</h3>
        <p>{{ product.productInfo.description }}</p>
      </div>
      <div>
        <span v-if="product.variantInfo.stock! > 0" class="text-green-700 font-bold">In stock</span>
        <span v-else class="text-red-500">Out of stock</span>
      </div>
      <div class="grid grid-cols-[auto_1fr_1fr] gap-6">
        <span class="font-bold">Colores</span>
        <template v-for="color in product.variantInfo.color" :key="product.productInfo.id+product.variantInfo.color">{{
          color }}</template>
        <span class="font-bold text-right">
          ${{
            parseInt(product.productInfo.price)
              .toLocaleString("es-CO", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })
          }}
        </span>

        <span class="font-bold">Marca</span>
        <span>{{ product.productInfo.brand }}</span>
        <div></div>

        <span class="font-bold">Talla</span>
        <div class="flex gap-1.5">
          <template v-for="size in product.variantInfo.size" :key="product.productInfo.size + product.variantInfo.id">
            <Button variant="outline">
              {{ size.toLocaleUpperCase() }}
            </Button>
          </template>
        </div>
      </div>

      <hr>

      <span class="font-bold text-xl">Agregar nuevo</span>
      <div class="grid grid-cols-[auto_1fr_1fr] gap-6">
        <span class="font-bold">Color</span>
        <div class="flex gap-2">
          <Button v-for="color in product.variantInfo.color" :key="product.productInfo.id + product.variantInfo.color">
            {{ color }}
          </Button>
          <Button variant="outline">
            +
          </Button>
        </div>
        <div></div>

        <!-- <form action=""> -->
        <!--   <div class="flex gap-6"></div> -->
        <!--   <label for="color-input"></label> -->
        <!--   <Input type="text" name="color-input" class="bg-white" /> -->
        <!-- </form> -->

        <span class="font-bold">Talla</span>
        <div class="flex gap-1.5">
          <Button v-for="size in product.variantInfo.size" :key="product.variantInfo.size">
            {{ size.toLocaleUpperCase() }}
          </Button>
          <Button variant="outline">
            +
          </Button>
        </div>
        <Button>Agregar</Button>
      </div>

    </div>

  </div>
</template>
