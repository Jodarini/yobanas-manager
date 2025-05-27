<script setup lang="ts">
  import { useToast } from '@/components/ui/toast/use-toast';
  import type { ProductWithVariant } from '~/db/schema';

  const { toast } = useToast();
  const route = useRoute();
  const store = useProductsStore();
  const { data, error, pending, refresh } = await store.fetchProduct(
    +route.params.id
  );
  const product = data.value?.product;
  const variants = data.value?.variants;

  const selectedSize = ref('');
  const selectedColor = ref('');

  const totalStock = computed(() =>
    variants?.reduce((total, variant) => (total += variant.stock), 0)
  );

  function selectColor(color: string) {
    selectedColor.value = color;
  }

  function selectSize(size: string) {
    selectedSize.value = size;
  }

  async function addProduct() {
    if (product) {
      const newProduct = ref<ProductWithVariant>(product);
      newProduct.value = {
        productInfo: {
          ...product.productInfo,
          price: parseInt(product.productInfo.price),
        },
        variantInfo: {
          ...product.variantInfo,
          color: selectedColor.value,
        },
      };

      try {
        const result = await $fetch('/api/product/add', {
          method: 'post',
          body: newProduct.value,
        });
        if (result.product) {
          store.addProduct(result.product);
          toast({
            title: `${result.message}`,
            description: `Se agregaron ${product.variantInfo.stock} nuevos productos al stock`,
          });
        }
      } catch (err) {
        toast({
          variant: 'destructive',
          title: `${err}`,
        });
        console.error(err);
      }
      store.addProduct(newProduct.value);
    }
  }
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

    <div v-if="product" class="flex w-full gap-6">
      <NuxtImg
        :src="product.productInfo.thumbnail"
        :alt="product.productInfo.title"
        loading="eager"
        class="h-full max-w-lg rounded-md object-contain"
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
            In stock ({{ totalStock }})
          </span>
          <span v-else class="text-red-500">Out of stock</span>
        </div>
        <div class="grid grid-cols-[auto_1fr_1fr] gap-2">
          <span class="font-bold">Colores</span>
          <div class="flex gap-2">
            <span v-for="variant in variants" :key="variant.id + variant.color">
              {{ variant.color }}
            </span>
          </div>
          <span class="text-right font-bold">
            ${{
              parseInt(product.productInfo.price).toLocaleString('es-CO', {
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

        <hr />

        <span class="text-xl font-bold">Agregar nuevo</span>
        <div class="grid grid-cols-[auto_1fr_1fr] gap-6">
          <span class="font-bold">Color</span>
          <div class="flex gap-2">
            <Button
              v-for="variant in variants"
              :key="variant.id + variant.color"
              :variant="selectedColor === variant.color ? 'default' : 'outline'"
              @click="selectColor(variant.color)"
            >
              {{ variant.color }} ({{ variant.stock }})
            </Button>
            <Button variant="outline">+</Button>
          </div>
          <div />

          <div v-if="product.variantInfo.size">
            <span class="font-bold">Talla</span>
            <div class="flex gap-1.5">
              <Button
                v-for="variant in variants"
                :key="variant.size || variant.id"
                @click="variant.size && selectSize(variant.size)"
              >
                <div v-if="variant.size">
                  {{ variant.size.toLocaleUpperCase() }}
                </div>
              </Button>
              <Button variant="outline">+</Button>
            </div>
          </div>
          <Button @click="addProduct">Agregar</Button>
        </div>
      </div>
    </div>
  </div>
</template>
