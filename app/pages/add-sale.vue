<script setup lang="ts">
  import { toast, ToastAction } from '~/components/ui/toast';
  import type { Product, ProductVariant } from '~~/db/schema';
  import { TrashIcon } from 'lucide-vue-next';
  import { Button } from '~/components/ui/button';

  const searchTerm = ref('');
  const selectedProduct = ref<Product | null>(null);
  const selectedProductId = computed(() => selectedProduct.value?.id);
  const cartStore = useCartStore();
  const isSubmitting = ref(false);

  const expandedVariant = ref(null);

  const { data, pending, error, refresh } = await useFetch('/api/products', {
    key: 'products',
    // getCachedData(key) {
    //   return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key];
    // },
  });

  const {
    data: variants,
    pending: variantsPending,
    refresh: variantsRefresh,
    execute,
  } = useFetch(() => `/api/product/${selectedProductId.value}/variants`, {
    key: () => `product-variants-${selectedProductId.value}`,
    immediate: false,
    watch: false,
  });

  watch(selectedProductId, async () => {
    await execute();
  });

  async function onSubmit() {
    isSubmitting.value = true;

    const items = cartStore.cart.map((p) => ({
      variantId: p.variant.id,
      quantity: p.stock,
    }));
    const res = await cartStore.checkout(items);

    isSubmitting.value = false;
    if (res.data && res.data.saleId) {
      cartStore.emptyCart();
      toast({
        title: 'Venta exitosa',
        description: 'La venta se ha registrado exitosamente',
      });
    }
    goToItem('productos');
    variantsRefresh();
  }

  function handleAddToCart(
    product: Product,
    variant: ProductVariant,
    quantity: number
  ) {
    if (quantity === undefined) {
      quantity = 1;
    }
    cartStore.addItem({
      title: product.title,
      id: product.id,
      price: product.price,
      variant: variant,
      stock: quantity,
    });
    variantStockToAdd[variant.id] = 1;
  }

  const searchOpen = ref(false);
  const variantStockToAdd = reactive<Record<string, number>>({});

  function selectProduct(product: Product) {
    selectedProduct.value = product;
    searchOpen.value = false;
    expandedVariant.value = null;
  }

  watch(searchTerm, () => {
    selectedProduct.value = null;
  });

  const filteredProducts = computed(() => {
    if (!data?.value) return [];
    const q = (searchTerm.value || '').toLowerCase();
    if (!q) return data.value;
    return data.value.filter((p) => p.title.toLowerCase().includes(q));
  });

  const sizeFilter = ref<string | null>(null);
  const colorFilter = ref<string | null>(null);

  const sizes = computed(() => {
    const set = new Set<string>();
    for (const v of variants.value ?? []) set.add(String(v.size));
    return Array.from(set);
  });
  const colors = computed(() => {
    const set = new Set<string>();
    for (const v of variants.value ?? []) set.add(String(v.color));
    return Array.from(set);
  });

  function toggleSize(s: string) {
    sizeFilter.value = sizeFilter.value === s ? null : s;
  }
  function toggleColor(c: string) {
    colorFilter.value = colorFilter.value === c ? null : c;
  }
  function clearVariantFilters() {
    sizeFilter.value = null;
    colorFilter.value = null;
  }

  const filteredVariants = computed(() => {
    let list = variants.value ?? [];
    if (sizeFilter.value)
      list = list.filter((v) => String(v.size) === sizeFilter.value);
    if (colorFilter.value)
      list = list.filter((v) => String(v.color) === colorFilter.value);
    return list;
  });

  // keep focus after add and show minimal feedback
  function quickAdd(product: Product, variant: ProductVariant) {
    const qty = variantStockToAdd[variant.id] ?? 1;
    handleAddToCart(product, variant, qty);

    toast({
      title: 'Agregado',
      description: `${product.title} • ${variant.size} • ${variant.color} x${qty}`,
      action: h(
        ToastAction,
        { altText: 'Ver carrito', asChild: true },
        {
          default: () =>
            h(
              Button,
              { variant: 'outline', onClick: () => goToItem('ventas') },
              { default: () => 'Ver' }
            ),
        }
      ),
    });
  }

  const openItem = ref<string | undefined>('productos');

  function goToItem(item: string, product?: Product) {
    if (product) selectedProduct.value = product;
    openItem.value = item;
  }

  function clearCart() {
    goToItem('productos');
    cartStore.emptyCart();
  }

  const remainingStock = computed(() => {
    return (variant: ProductVariant) => {
      if (!variant) return 0;
      const cartItem = cartStore.cart.find((p) => p.variant.id === variant.id);
      const stockInCart = cartItem?.stock ?? 0;
      const remaining = variant.stock - stockInCart;
      return remaining;
    };
  });
</script>

<template>
  <Tabs v-model="openItem" default-value="productos" class="h-full w-full">
    <TabsList class="bg-accent grid w-full grid-cols-2">
      <TabsTrigger value="productos">Agrega productos</TabsTrigger>
      <TabsTrigger value="ventas">Carrito</TabsTrigger>
    </TabsList>
    <TabsContent value="productos" class="max-h-full overflow-hidden">
      <Card class="flex h-full">
        <form class="flex h-full w-full flex-col" @submit="onSubmit">
          <CardHeader>
            <CardTitle>Agregar venta</CardTitle>
            <CardDescription>Agregar una venta a tu inventario</CardDescription>
          </CardHeader>

          <CardContent class="min-h-0 flex-1 p-4 lg:p-6">
            <Input
              v-model="searchTerm"
              placeholder="Buscar producto"
              @click="selectedProduct = null"
            />

            <div v-if="!selectedProduct" class="flex flex-col gap-2">
              <Button
                v-for="product in filteredProducts"
                :key="product.sku"
                type="button"
                :value="product"
                variant="ghost"
                class="justify-start"
                @click="selectProduct(product)"
              >
                {{ product.title }}
              </Button>
            </div>

            <div
              class="border-border mt-2 flex h-full flex-col gap-4 border-t py-2 lg:flex-row"
            >
              <!-- Detail (Variants + Summary) -->
              <section class="flex min-h-0 w-full flex-1 flex-col gap-4">
                <!-- Variants panel -->
                <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <!-- Sticky product/context bar with quick filters -->
                  <div v-if="selectedProduct" class="border-border border-b">
                    <h3 class="mb-2 text-2xl font-bold">
                      {{ selectedProduct.title }}
                    </h3>
                    <div
                      class="flex items-center gap-2 overflow-x-auto px-2 pb-2"
                    >
                      <!-- Size chips -->
                      <div class="flex items-center gap-2">
                        <Button
                          v-for="size in sizes"
                          :key="size"
                          variant="ghost"
                          type="button"
                          class="border-border rounded-full border px-2 py-1 text-xs"
                          :class="sizeFilter === size ? 'bg-accent' : ''"
                          @click="toggleSize(size)"
                        >
                          {{ size }}
                        </Button>
                      </div>

                      <!-- Color chips -->
                      <div class="flex items-center gap-2">
                        <Button
                          v-for="color in colors"
                          :key="color"
                          variant="ghost"
                          type="button"
                          class="border-border rounded-full border px-2 py-1 text-xs"
                          :class="colorFilter === color ? 'bg-accent' : ''"
                          @click="toggleColor(color)"
                        >
                          {{ color }}
                        </Button>
                      </div>

                      <Button
                        v-if="sizeFilter || colorFilter"
                        type="button"
                        variant="ghost"
                        class="ml-auto"
                        @click="clearVariantFilters"
                      >
                        Limpiar filtros
                      </Button>
                    </div>
                  </div>

                  <!-- Loading and empty states -->
                  <div
                    v-if="variantsPending"
                    class="text-muted-foreground p-3 text-sm"
                  >
                    Cargando variantes…
                  </div>
                  <div
                    v-else-if="selectedProduct && !filteredVariants?.length"
                    class="text-muted-foreground p-3 text-sm"
                  >
                    No hay variantes que coincidan con los filtros.
                  </div>

                  <!-- Scrollable list -->
                  <div
                    v-if="selectedProduct"
                    class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-8"
                  >
                    <div
                      v-for="(variant, idx) in filteredVariants"
                      :key="variant.id"
                      class="border-border bg-card/40 hover:bg-card/60 border-b p-2 transition-colors"
                    >
                      <!-- Compact row -->
                      <div
                        class="flex flex-col justify-between gap-2 md:flex-row"
                      >
                        <div>
                          <p class="truncate text-sm font-medium">
                            {{ variant.size }} • {{ variant.color }}
                          </p>
                          <p class="text-muted-foreground text-xs">
                            Stock: {{ variant.stock }} En carrito:
                            {{
                              cartStore.cart.find(
                                (p) => p.variant.id === variant.id
                              )?.stock || 0
                            }}
                          </p>
                        </div>
                        <!-- Quantity -->
                        <NumberField
                          v-model="variantStockToAdd[variant.id]"
                          :default-value="1"
                          :min="1"
                          class="w-full md:w-28"
                          :max="remainingStock(variant)"
                        >
                          <Label hidden>Cantidad</Label>
                          <NumberFieldContent>
                            <NumberFieldDecrement @mousedown.prevent />
                            <NumberFieldInput />
                            <NumberFieldIncrement @mousedown.prevent />
                          </NumberFieldContent>
                        </NumberField>

                        <!-- Quick add -->
                        <Button
                          type="button"
                          :disabled="remainingStock(variant) === 0"
                          @click="quickAdd(selectedProduct, variant)"
                        >
                          Agregar
                        </Button>
                      </div>

                      <!-- Optional details -->
                      <div
                        v-if="expandedVariant === idx"
                        class="px-3 pb-3 sm:hidden"
                      >
                        <ul class="text-muted-foreground space-y-1 text-xs">
                          <li>SKU: {{ variant.sku || '—' }}</li>
                          <li>
                            Precio:
                            {{
                              (
                                variant.price ?? selectedProduct.price
                              ).toLocaleString('es-CO', {
                                style: 'currency',
                                currency: 'COP',
                                minimumFractionDigits: 0,
                              })
                            }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Summary -->
              </section>
            </div>
          </CardContent>
        </form>
      </Card>
    </TabsContent>
    <TabsContent value="ventas" class="h-full overflow-hidden">
      <Card class="h-full">
        <CardHeader>
          <CardTitle>Resumen de ventas</CardTitle>
        </CardHeader>
        <CardContent class="flex-1 overflow-y-auto">
          <div class="flex flex-col gap-2">
            <div
              v-for="prod in cartStore.cart"
              :key="prod.id"
              class="border-border overflow-y-auto border-b p-3"
            >
              <div
                class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold">
                    {{ prod.title }}
                    <span class="text-muted-foreground">
                      • {{ prod.variant.size }} • {{ prod.variant.color }}
                    </span>
                  </p>
                  <div class="mt-2 flex gap-2 md:items-center">
                    <span class="text-muted-foreground text-xs">Cant.:</span>
                    <NumberField
                      :default-value="prod.stock"
                      :min="1"
                      :max="prod.variant.stock"
                      @update:model-value="
                        (val) =>
                          cartStore.handleQuantityChange(prod.variant.id, val)
                      "
                    >
                      <Label hidden>Cantidad</Label>
                      <NumberFieldContent>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                      </NumberFieldContent>
                    </NumberField>
                  </div>
                </div>
                <div class="flex flex-col gap-2 md:flex-row md:items-center">
                  <p class="font-semibold">
                    {{
                      (prod.price * prod.stock).toLocaleString('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                      })
                    }}
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    @click="cartStore.removeItem(prod.variant.id)"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter
          class="flex flex-col items-start justify-between gap-4 justify-self-end md:flex-row"
        >
          <p class="text-base font-bold lg:text-xl">
            Total:
            {{
              cartStore.totalPrice.toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
              })
            }}
          </p>
          <div class="flex w-full flex-col gap-2 md:w-auto md:flex-row">
            <Button
              type="button"
              variant="outline"
              class="w-full md:w-auto"
              @click="clearCart"
            >
              Limpiar
            </Button>

            <Button
              type="submit"
              :disabled="isSubmitting || cartStore.cart.length === 0"
              @click="onSubmit"
            >
              <span v-if="isSubmitting" class="flex items-center">
                <Spinner class="mr-2" />
                Completando venta...
              </span>
              <span v-else>Completar venta</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </TabsContent>
  </Tabs>
</template>
