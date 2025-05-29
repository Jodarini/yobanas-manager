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
  const colors = computed(
    () => new Set(variants?.map((variant) => variant.color))
  );
  const sizes = computed(
    () => new Set(variants?.map((variant) => variant.size))
  );

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

  const productStock = computed(() => {
    return variants?.find(
      (variant) =>
        variant.color === selectedColor.value &&
        variant.size === selectedSize.value
    );
  });

  function addStock() {
    if (!productStock.value) return;
    productStock.value.stock++;
  }

  function reduceStock() {
    if (!productStock.value || productStock.value.stock === 0) return;
    if (productStock.value.stock < 0) {
      productStock.value.stock = 0;
    }
    productStock.value.stock--;
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
          size: selectedSize.value,
          stock: productStock.value?.stock || 0,
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
            description: `Nuevo stock: ${productStock.value?.stock}`,
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
    // toast({
    //   variant: 'destructive',
    //   title: `Seleccione una variante primero.`,
    // });
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

    <div v-else-if="product" class="flex w-full flex-col gap-6 md:flex-row">
      <NuxtImg
        :src="product.productInfo.thumbnail"
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
            <div variant="outline" v-for="color in colors" :key="color">
              {{ color }}
            </div>
          </div>
          <span class="col-span-3 font-bold md:col-span-1 md:text-right">
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

        <hr />

        <span class="text-xl font-bold">Agregar nuevo</span>
        <div class="grid grid-cols-[auto_1fr] gap-6">
          <span class="font-bold">Color</span>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="color in colors"
              :key="color"
              :variant="selectedColor === color ? 'default' : 'outline'"
              @click="selectColor(color)"
            >
              {{ color }}
            </Button>
            <Button variant="outline">+</Button>
          </div>

          <template v-if="product.variantInfo.size">
            <span class="font-bold">Talla</span>
            <div class="flex flex-wrap gap-1.5">
              <Button
                v-for="size in sizes"
                :key="size + 'admn'"
                @click="size && selectSize(size)"
                :variant="selectedSize === size ? 'default' : 'outline'"
              >
                <div v-if="size">
                  {{ size.toLocaleUpperCase() }}
                </div>
              </Button>
              <Button variant="outline">+</Button>
            </div>
          </template>
          <template v-if="selectedSize && selectedColor">
            <Label for="stock">Stock</Label>
            <NumberField id="stock" v-model="productStock.stock" :min="0">
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </template>
          <Button
            @click="addProduct"
            :disabled="!selectedSize && !selectedColor"
          >
            Actualizar producto
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
