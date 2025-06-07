<script setup lang="ts">
  const route = useRoute();
  const store = useProductsStore();
  const { data, error, pending, refresh } = await store.fetchProduct(
    +route.params.id
  );
  const product = data.value?.product;
  const variants = data.value?.variants;
  const colors = computed(
    () => new Set(variants?.map((variant) => variant.color))
  );
  const sizes = computed(
    () => new Set(variants?.map((variant) => variant.size))
  );

  const totalStock = computed(() =>
    variants?.reduce((total, variant) => (total += variant.stock), 0)
  );
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="pending" class="flex min-h-[400px] items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div
          class="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"
        />
        <p class="text-gray-600">Cargando producto...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="flex min-h-[400px] flex-col items-center justify-center gap-4"
      style="bottom: 0"
    >
      <div class="text-center text-red-500">
        <h2 class="mb-2 text-2xl font-bold">Error al cargar el producto</h2>
        <p class="mb-4 text-gray-600">
          {{ error.message || 'Ha ocurrido un error inesperado' }}
        </p>
        <Button variant="outline" @click="refresh">Intentar de nuevo</Button>
      </div>
    </div>

    <!-- Product Not Found -->
    <div
      v-else-if="!product"
      class="flex min-h-[400px] flex-col items-center justify-center"
    >
      <h2 class="mb-4 text-2xl font-bold text-gray-800">
        Producto no encontrado
      </h2>
      <p class="mb-4 text-gray-600">
        El producto que buscas no existe o ha sido eliminado.
      </p>
      <NuxtLink to="/">
        <Button>Ver todos los productos</Button>
      </NuxtLink>
    </div>

    <div v-else-if="product" class="flex w-full flex-col gap-6 md:flex-row">
      <NuxtImg
        :src="product.productInfo.thumbnail || undefined"
        :alt="product.productInfo.title"
        loading="eager"
        class="h-full rounded-md object-contain md:max-w-lg"
      />
      <div class="flex max-w-lg flex-col gap-4">
        <div>
          <h3 class="mb-2 text-4xl font-semibold">
            {{ product.productInfo.title }}
          </h3>
          <p>{{ product.productInfo.description }}</p>
        </div>
        <div>
          <span
            v-if="product.variantInfo.stock! > 0"
            class="font-bold text-green-700"
          >
            En stock ({{ totalStock }})
          </span>
          <span v-else class="text-red-500">Out of stock</span>
        </div>
        <div
          class="grid grid-cols-[auto_1fr] gap-2 md:grid-cols-[auto_1fr_1fr]"
        >
          <span class="font-bold">Colores</span>
          <div class="flex flex-wrap gap-2">
            <div v-for="color in colors" :key="color" variant="outline">
              {{ color }}
            </div>
          </div>
          <span class="col-span-3 font-bold md:col-span-1 md:text-right">
            ${{
              product.productInfo.price.toLocaleString('es-CO', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })
            }}
          </span>

          <span class="font-bold">Marca</span>
          <span>{{ product.productInfo.brand }}</span>
          <div />

          <template v-if="product.variantInfo.size">
            <p class="font-bold">Talla</p>
            <div class="flex flex-wrap gap-1.5">
              <template v-for="size in sizes" :key="size">
                <div v-if="size">
                  <div variant="outline">
                    {{ size.toLocaleUpperCase() }}
                  </div>
                </div>
              </template>
            </div>
          </template>
        </div>
        <div class="flex justify-end">
          <AddProductVariantDialog :variants />
          <EditProductDialog :product :variants />
        </div>
      </div>
    </div>
  </div>
</template>
