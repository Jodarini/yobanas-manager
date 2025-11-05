<script setup lang="ts">
import { cn } from "@/lib/utils"
import { refDebounced } from '@vueuse/core'
import { useForm } from 'vee-validate'
import { toast, ToastAction } from '~/components/ui/toast'
import type { Product, ProductVariant } from '~~/db/schema'
import { TrashIcon } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

const searchTerm = ref('')
const debouncedSearchTerm = refDebounced(searchTerm, 500) // 300ms debounce
const selectedProduct = ref<Product>()
const selectedProductId = computed(() => selectedProduct.value?.id)
const cartStore = useCartStore()


const expandedVariant = ref(null)
const { data, pending, error, refresh } =
  useFetch(() => `/api/products?search=${debouncedSearchTerm.value}`, {
    watch: [debouncedSearchTerm],
    lazy: true,
  })

const { data: variants, pending: variantsPending, execute } = useFetch(
  () => `/api/product/${selectedProductId.value}/variants`,
  {
    key: () => `product-variants-${selectedProductId.value}`,
    immediate: false,
    watch: false,
  }
)

watch(selectedProductId, async () => {
  await execute()
})


async function onSubmit() {
  const items = cartStore.cart.map(p => ({
    variantId: p.variant.id,
    quantity: p.stock,
  }))
  await cartStore.checkout(items)
}

function handleAddToCart(product: Product, variant: ProductVariant, quantity:
  number) {
  if (quantity === undefined) {
    quantity = 1
  }
  cartStore.addItem({ title: product.title, id: product.id, price: product.price, variant: variant, stock: quantity })
}

const searchOpen = ref(false)
const variantStockToAdd = reactive<Record<string, number>>({})

function selectProduct(product: Product) {
  selectedProduct.value = product
  searchOpen.value = false
  expandedVariant.value = null
}

function clearSelection() {
  selectedProduct.value = undefined
  expandedVariant.value = null
  searchOpen.value = true
}

// Optional: compute filtered products against debounced term
const filteredProducts = computed(() => {
  if (!data?.value) return []
  const q = (searchTerm.value || '').toLowerCase()
  if (!q) return data.value
  return data.value.filter(p => p.title.toLowerCase().includes(q))
})


// quick filters
const showAvailableOnly = ref(true)
const sizeFilter = ref<string | null>(null)
const colorFilter = ref<string | null>(null)

const sizes = computed(() => {
  const set = new Set<string>()
  for (const v of variants.value ?? []) set.add(String(v.size))
  return Array.from(set)
})
const colors = computed(() => {
  const set = new Set<string>()
  for (const v of variants.value ?? []) set.add(String(v.color))
  return Array.from(set)
})

function toggleSize(s: string) {
  sizeFilter.value = sizeFilter.value === s ? null : s
}
function toggleColor(c: string) {
  colorFilter.value = colorFilter.value === c ? null : c
}
function clearVariantFilters() {
  sizeFilter.value = null
  colorFilter.value = null
}

const filteredVariants = computed(() => {
  let list = (variants.value ?? [])
  if (showAvailableOnly.value) list = list.filter(v => (v.stock ?? 0) > 0)
  if (sizeFilter.value) list = list.filter(v => String(v.size) === sizeFilter.value)
  if (colorFilter.value) list = list.filter(v => String(v.color) === colorFilter.value)
  return list
})

// keep focus after add and show minimal feedback
function quickAdd(product: Product, variant: ProductVariant) {
  const qty = variantStockToAdd[variant.id] ?? 1
  handleAddToCart(product, variant, qty)
  // preserve focus for fast repeated adds
  // optional: fire a light toast
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
            { onClick: () => goToItem('item-2', product) },
            { default: () => 'Ver' }
          ),
      }
    ),
  })
}

const openItem = ref<string | undefined>('item-0')

function goToItem(item: string, product?: Product) {
  if (product) selectedProduct.value = product
  openItem.value = item
}
const value = ref<Product | undefined>()
</script>

<template>
  <Tabs default-value="productos" class="w-full h-full">
    <TabsList class="grid w-full grid-cols-2 bg-accent">
      <TabsTrigger value="productos">
        Agrega productos
      </TabsTrigger>
      <TabsTrigger value="ventas">
        Ventas
      </TabsTrigger>
    </TabsList>
    <TabsContent value="productos" class="max-h-full overflow-hidden">
      <Card class="h-full flex">
        <form class="w-full h-full flex flex-col" @submit="onSubmit">
          <CardHeader>
            <CardTitle>Agregar venta</CardTitle>
            <CardDescription>Agregar una venta a tu inventario</CardDescription>
          </CardHeader>

          <CardContent class="min-h-0 flex-1 p-4 lg:p-6 ">
            <Combobox v-model="value" by="label">
              <ComboboxAnchor as-child class="mb-4">
                <ComboboxTrigger as-child>
                  <Button variant="outline" class="justify-between w-full" type="button">
                    {{ value?.title ?? 'Selecciona un producto' }}
                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                  <!---->
                  <!-- <Button :disabled="!selectedProduct" variant="outline" @click="clearSelection"> -->
                  <!--   Limpiar -->
                  <!-- </Button> -->
                </ComboboxTrigger>
              </ComboboxAnchor>

              <ComboboxList class="md:w-xl" align="start">
                <div class="relative w-full max-w-full items-center">
                  <ComboboxInput class="focus-visible:ring-0 border-0 rounded-none h-10"
                    placeholder="Selecciona un producto..." v-model="searchTerm" />
                  <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                    <Search class="size-4 text-muted-foreground" />
                  </span>
                </div>

                <ComboboxEmpty>
                  Productos no encontrados.
                </ComboboxEmpty>

                <ComboboxGroup>
                  <ComboboxItem v-for="product in filteredProducts" :key="product.title" :value="product"
                    @click="selectProduct(product)">
                    {{ product.title }}
                    <ComboboxItemIndicator>
                      <Check :class="cn('ml-auto h-4 w-4')" />
                    </ComboboxItemIndicator>
                  </ComboboxItem>
                </ComboboxGroup>
              </ComboboxList>
            </Combobox>


            <div class="flex flex-col lg:flex-row gap-4 h-full">

              <!-- Detail (Variants + Summary) -->
              <section class="flex flex-col gap-4 w-full min-h-0 flex-1">
                <!-- Variants panel -->
                <div class="flex flex-col overflow-hidden flex-1 min-h-0">
                  <!-- Sticky product/context bar with quick filters -->
                  <div v-if="selectedProduct" class="border-b border-border">

                    <!-- Quick filters row -->
                    <div class="px-2 pb-2 flex items-center gap-2 overflow-x-auto">
                      <!-- <Button type="button" size="sm" variant="outline" :class="{ 'bg-accent': showAvailableOnly }" -->
                      <!--   @click="showAvailableOnly = !showAvailableOnly"> -->
                      <!--   Solo disponibles -->
                      <!-- </Button> -->

                      <!-- Size chips -->
                      <div class="flex items-center gap-2">
                        <Button variant="ghost" v-for="size in sizes" :key="size" type="button"
                          class="px-2 py-1 rounded-full border border-border text-xs"
                          :class="sizeFilter === size ? 'bg-accent' : ''" @click="toggleSize(size)">
                          {{ size }}
                        </Button>
                      </div>

                      <!-- Color chips -->
                      <div class="flex items-center gap-2">
                        <Button variant="ghost" v-for="color in colors" :key="color" type="button"
                          class="px-2 py-1 rounded-full border border-border text-xs"
                          :class="colorFilter === color ? 'bg-accent' : ''" @click="toggleColor(color)">
                          {{ color }}
                        </Button>
                      </div>

                      <Button v-if="sizeFilter || colorFilter" type="button" variant="ghost" class="ml-auto"
                        @click="clearVariantFilters">
                        Limpiar filtros
                      </Button>
                    </div>
                  </div>

                  <!-- Loading and empty states -->
                  <div v-if="variantsPending" class="p-3 text-sm text-muted-foreground">Cargando variantes…</div>
                  <div v-else-if="selectedProduct && !filteredVariants?.length"
                    class="p-3 text-sm text-muted-foreground">
                    No hay variantes que coincidan con los filtros.
                  </div>

                  <!-- Scrollable list -->
                  <div v-if="selectedProduct" class="flex flex-col gap-2 overflow-y-auto min-h-0 flex-1 pb-8">
                    <div v-for="(variant, idx) in filteredVariants" :key="variant.id"
                      class="border-border border-b bg-card/40 hover:bg-card/60 transition-colors p-2">
                      <!-- Compact row -->
                      <div class="flex flex-row justify-between">
                        <div>
                          <p class="text-sm font-medium truncate">
                            {{ variant.size }} • {{ variant.color }}
                          </p>
                          <p class="text-xs text-muted-foreground">Stock: {{ variant.stock }}</p>
                        </div>
                        <div class="flex gap-2">
                          <!-- Quantity -->
                          <NumberField v-model="variantStockToAdd[variant.id]" :default-value="1" :min="1" class="w-28"
                            :max="variant.stock">
                            <Label hidden>Cantidad</Label>
                            <NumberFieldContent>
                              <NumberFieldDecrement />
                              <NumberFieldInput />
                              <NumberFieldIncrement />
                            </NumberFieldContent>
                          </NumberField>

                          <!-- Quick add -->
                          <Button type="button" @click="quickAdd(selectedProduct, variant)">
                            Agregar
                          </Button>
                        </div>
                      </div>

                      <!-- Optional details -->
                      <div v-if="expandedVariant === idx" class="px-3 pb-3 sm:hidden">
                        <ul class="text-xs text-muted-foreground space-y-1">
                          <li>SKU: {{ variant.sku || '—' }}</li>
                          <li>Precio: {{ (variant.price ?? selectedProduct.price).toLocaleString('es-CO', {
                            style: 'currency', currency: 'COP', minimumFractionDigits: 0
                          }) }}</li>
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
            <div v-for="prod in cartStore.cart" :key="prod.id" class="p-3 border-b border-border overflow-y-auto">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-semibold text-sm truncate">
                    {{ prod.title }}
                    <span class="text-muted-foreground"> • {{ prod.variant.size }} • {{ prod.variant.color }}</span>
                  </p>
                  <div class="flex md:items-center gap-2 mt-2">
                    <span class="text-xs text-muted-foreground">Cant.:</span>
                    <NumberField :default-value="prod.stock" :min="1" :max="prod.variant.stock"
                      @update:model-value="val => cartStore.handleQuantityChange(prod.variant.id, val)">
                      <Label hidden>Cantidad</Label>
                      <NumberFieldContent>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                      </NumberFieldContent>
                    </NumberField>
                  </div>
                </div>
                <div class="flex flex-col md:flex-row md:items-center gap-2">
                  <p class="font-semibold">
                    {{ (prod.price * prod.stock).toLocaleString('es-CO', {
                      style: 'currency', currency: 'COP', minimumFractionDigits: 0
                    }) }}
                  </p>
                  <Button type="button" @click="cartStore.removeItem(prod.variant.id)" variant="destructive">
                    <TrashIcon class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter class="flex flex-col items-start justify-between md:flex-row gap-4 justify-self-end">
          <p class="text-base lg:text-xl font-bold">
            Total:
            {{ cartStore.totalPrice.toLocaleString('es-CO', {
              style: 'currency', currency: 'COP', minimumFractionDigits: 0
            }) }}
          </p>
          <div class="flex flex-col gap-2 md:flex-row w-full md:w-auto">
            <Button type="button" @click="cartStore.emptyCart" variant="outline"
              class="w-full md:w-auto">Limpiar</Button>
            <Button class="w-full md:w-auto" @click="onSubmit">Completar
              venta</Button>
          </div>
        </CardFooter>
      </Card>
    </TabsContent>
  </Tabs>

</template>
