<script setup lang="ts">
const route = useRoute();
const store = useProductsStore();
const { data, status, error, pending, refresh } = await store.fetchProduct(+route.params.id);
const product = data.value?.product;
const variants = data.value?.variants

</script>

<template>

  <!-- Loading State -->
  <div v-if="pending" class="flex items-center justify-center min-h-[400px]">
    <div class="flex flex-col items-center gap-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      <p class="text-gray-600">Cargando producto...</p>
    </div>
  </div>

  <!-- Error State -->
  <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[400px] gap-4" style="bottom: 0;">
    <div class="text-red-500 text-center">
      <h2 class="text-2xl font-bold mb-2">Error al cargar el producto</h2>
      <p class="text-gray-600 mb-4">{{ error.message || 'Ha ocurrido un error inesperado' }}</p>
      <Button variant="outline" @click="refresh">
        Intentar de nuevo
      </Button>
    </div>
  </div>

  <!-- Product Not Found -->
  <div v-else-if="!product" class="flex flex-col items-center justify-center min-h-[400px]">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h2>
    <p class="text-gray-600 mb-4">El producto que buscas no existe o ha sido eliminado.</p>
    <NuxtLink to="/">
      <Button>Ver todos los productos</Button>
    </NuxtLink>
  </div>

  <div v-if="product" class="flex w-full gap-6">
    <NuxtImg
:src="product.productInfo.thumbnail" :alt="product.productInfo.title" loading="eager"
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
      <div class="grid grid-cols-[auto_1fr_1fr] gap-2">
        <span class="font-bold">Colores</span>
        <div class="flex gap-2">
          <span v-for="variant in variants" :key="variant.id + variant.color">
            {{ variant.color }}
          </span>
        </div>
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
        <div />

        <template v-if="product.variantInfo.size">
          <span class="font-bold">Talla</span>
          <div class="flex gap-1.5">
            <template v-for="variant in variants" :key="variant.size">
              <div v-if="variant.size">
                <Button variant="outline">
                  {{ variant.size.toLocaleUpperCase() }}
                </Button>
              </div>
            </template>
          </div>
        </template>
      </div>

      <hr>

      <span class="font-bold text-xl">Agregar nuevo</span>
      <div class="grid grid-cols-[auto_1fr_1fr] gap-6">
        <span class="font-bold">Color</span>
        <div class="flex gap-2">
          <Button v-for="variant in variants" :key="variant.id + variant.color">
            {{ variant.color }}
          </Button>
          <Button variant="outline">
            +
          </Button>
        </div>
        <div />

        <!-- <form action=""> -->
        <!--   <div class="flex gap-6"></div> -->
        <!--   <label for="color-input"></label> -->
        <!--   <Input type="text" name="color-input" class="bg-white" /> -->
        <!-- </form> -->

        <div v-if="product.variantInfo.size">
          <span class="font-bold">Talla</span>
          <div class="flex gap-1.5">
            <Button v-for="variant in variants" :key="variant.size || variant.id">
              <div v-if="variant.size">
                {{ variant.size.toLocaleUpperCase() }}
              </div>
            </Button>
            <Button variant="outline">
              +
            </Button>
          </div>
        </div>
        <Button>Agregar</Button>
      </div>

    </div>

  </div>
</template>
