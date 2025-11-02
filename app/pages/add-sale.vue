<script setup lang="ts">
import { cn } from "@/lib/utils"
import { refDebounced } from '@vueuse/core'
import { useForm } from 'vee-validate'
import { toast, ToastAction } from '~/components/ui/toast'
import type { Product, ProductVariant } from '~~/db/schema'
import { TrashIcon, PlusCircleIcon, ChevronDown } from 'lucide-vue-next'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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

const { handleSubmit, values, setFieldValue, resetForm, isSubmitting } =
  useForm({
    // validationSchema: formSchema,
    // initialValues: props.initialValues || {
    //   title: 'test',
    //   description: 'test',
    //   price: 1000,
    //   category: ['test'],
    //   brand: 'test',
    //   variants: [{ size: '', stock: 0, color: '' }],
    // },
  });

const onSubmit = handleSubmit(
  async (values) => {
    // console.log(values)
  },
  ({ errors }) => {
    toast({
      variant: 'destructive',
      title: 'Error en el formulario',
      description: 'Verifique los campos marcados en rojo',
    });
    console.error(errors);
  }
);

function handleAddToCart(product: Product, variant: ProductVariant, quantity:
  number) {
  if (quantity === undefined) {
    quantity = 1
  }
  cartStore.addItem({ title: product.title, id: product.id, price: product.price, variant: variant, stock: quantity })
}

const variantQuantity = ref(0)
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
  <Tabs default-value="productos" class="w-full">
    <TabsList class="grid w-full grid-cols-2 ">
      <TabsTrigger value="productos">
        Agrega productos
      </TabsTrigger>
      <TabsTrigger value="ventas">
        Ventas
      </TabsTrigger>
    </TabsList>
    <TabsContent value="productos">
      <Card class="hidden min-h-screen lg:min-h-2/3 lg:flex">
        <form class="w-full h-full flex flex-col" @submit="onSubmit">
          <CardHeader class="border-b shrink-0">
            <CardTitle>Agregar venta</CardTitle>
            <CardDescription>Agregar una venta a tu inventario</CardDescription>
          </CardHeader>

          <CardContent class="min-h-0 flex-1 p-4 lg:p-6">
            <Combobox v-model="value" by="label">
              <ComboboxAnchor as-child>
                <ComboboxTrigger as-child>
                  <Button variant="outline" class="justify-between w-full">
                    {{ value?.title ?? 'Selecciona un producto' }}
                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>

                  <Button v-if="selectedProduct" variant="outline" size="sm" class="hidden lg:inline-flex"
                    @click="clearSelection">
                    Limpiar
                  </Button>
                </ComboboxTrigger>
              </ComboboxAnchor>

              <ComboboxList>
                <div class="relative w-full max-w-full items-center">
                  <ComboboxInput class="focus-visible:ring-0 border-0 rounded-none h-10"
                    placeholder="Selecciona un producto..." v-model="searchTerm" />
                  <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                    <Search class="size-4 text-muted-foreground" />
                  </span>
                </div>

                <ComboboxEmpty>
                  No framework found.
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
              <!-- Search (Master) -->
              <!-- <aside class="flex flex-col gap-3 w-full lg:max-w-80 xl:max-w-96 lg:border-r lg:pr-4 min-h-0"> -->
              <!--   <!-- Mobile collapsible header once selected -->
              <!--   <div v-if="selectedProduct" class="lg:hidden"> -->
              <!--     <Button type="button" class="min-w-full justify-between" variant="outline" -->
              <!--       @click="searchOpen = !searchOpen"> -->
              <!--       <span class="font-medium text-sm truncate">{{ selectedProduct.title }}</span> -->
              <!--       <ChevronDown :class="{ 'rotate-180': searchOpen }" class="w-4 h-4 transition-transform" /> -->
              <!--     </Button> -->
              <!--   </div> -->
              <!---->
              <!--   <!-- Search body -->
              <!--   <div class="flex flex-col gap-3 overflow-hidden" -->
              <!--     :class="selectedProduct ? (searchOpen ? '' : 'hidden lg:flex') : ''"> -->
              <!--     <div class="flex gap-2"> -->
              <!--       <Input placeholder="Buscar producto..." v-model="searchTerm" class="text-sm flex-1" /> -->
              <!--       <Button v-if="selectedProduct" variant="outline" size="sm" class="hidden lg:inline-flex" -->
              <!--         @click="clearSelection"> -->
              <!--         Limpiar -->
              <!--       </Button> -->
              <!--     </div> -->
              <!---->
              <!--     <div class="min-h-32 max-h-64 lg:max-h-none overflow-auto rounded-lg border"> -->
              <!--       <div v-if="pending" class="p-3 text-xs text-muted-foreground">Buscando…</div> -->
              <!--       <div v-else-if="error" class="p-3 text-xs text-destructive">Error cargando productos</div> -->
              <!--       <div v-else-if="!filteredProducts?.length" class="p-3 text-xs text-muted-foreground">Sin resultados -->
              <!--       </div> -->
              <!---->
              <!--       <div v-for="product in filteredProducts" :key="product.id" -->
              <!--         class="p-2 hover:bg-accent cursor-pointer transition-colors text-sm" -->
              <!--         :class="{ 'bg-accent': selectedProduct?.id === product.id }" @click="selectProduct(product)"> -->
              <!--         {{ product.title }} -->
              <!--       </div> -->
              <!--     </div> -->
              <!---->
              <!--   </div> -->
              <!-- </aside> -->

              <!-- Detail (Variants + Summary) -->
              <section class="flex flex-col gap-4 w-full min-h-0 flex-1">
                <!-- Variants panel -->
                <div class="flex flex-col overflow-hidden flex-1 min-h-0">
                  <!-- Sticky product/context bar with quick filters -->
                  <div v-if="selectedProduct"
                    class="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                    <div class="flex items-center justify-between gap-2 px-2 py-2">
                      <div class="min-w-0">
                        <h2 class="text-sm lg:text-lg font-semibold truncate">{{ selectedProduct.title }}</h2>
                        <p class="text-[11px] lg:text-xs text-muted-foreground">Selecciona variantes y cantidades.</p>
                      </div>
                      <div class="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" class="hidden lg:inline-flex"
                          @click="selectedProduct = undefined">Cambiar</Button>
                        <Button variant="outline" size="sm" class="lg:hidden" @click="searchOpen = !searchOpen">
                          {{ searchOpen ? 'Ocultar' : 'Buscar' }}
                        </Button>
                      </div>
                    </div>

                    <!-- Quick filters row -->
                    <div class="px-2 pb-2 flex items-center gap-2 overflow-x-auto">
                      <!-- <Button type="button" size="sm" variant="outline" :class="{ 'bg-accent': showAvailableOnly }" -->
                      <!--   @click="showAvailableOnly = !showAvailableOnly"> -->
                      <!--   Solo disponibles -->
                      <!-- </Button> -->

                      <!-- Size chips -->
                      <div class="flex items-center gap-2">
                        <Button variant="ghost" v-for="size in sizes" :key="size" type="button"
                          class="px-2 py-1 rounded-full border text-xs" :class="sizeFilter === size ? 'bg-accent' : ''"
                          @click="toggleSize(size)">
                          {{ size }}
                          kjasd
                        </Button>
                      </div>

                      <!-- Color chips -->
                      <div class="flex items-center gap-2">
                        <Button variant="ghost" v-for="color in colors" :key="color" type="button"
                          class="px-2 py-1 rounded-full border text-xs"
                          :class="colorFilter === color ? 'bg-accent' : ''" @click="toggleColor(color)">
                          {{ color }}
                        </Button>
                      </div>

                      <Button v-if="sizeFilter || colorFilter" type="button" size="sm" variant="ghost" class="ml-auto"
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
                  <div v-if="selectedProduct" class="flex flex-col gap-2 overflow-y-auto min-h-0 flex-1 px-1 py-1">
                    <div v-for="(variant, idx) in filteredVariants" :key="variant.id"
                      class="rounded-lg border bg-card/40 hover:bg-card/60 transition-colors">
                      <!-- Compact row -->
                      <div class="grid grid-cols-12 items-center gap-2 p-2">
                        <div class="col-span-7 sm:col-span-6 lg:col-span-6 min-w-0">
                          <p class="text-sm font-medium truncate">
                            {{ variant.size }} • {{ variant.color }}
                          </p>
                          <p class="text-xs text-muted-foreground">Stock: {{ variant.stock }}</p>
                        </div>

                        <!-- Quantity -->
                        <div class="col-span-3 sm:col-span-3 lg:col-span-3 flex items-center justify-end">
                          <NumberField v-model="variantStockToAdd[variant.id]" :default-value="1" :min="1"
                            :max="variant.stock" class="min-w-24">
                            <Label hidden>Cantidad</Label>
                            <NumberFieldContent>
                              <NumberFieldDecrement />
                              <NumberFieldInput />
                              <NumberFieldIncrement />
                            </NumberFieldContent>
                          </NumberField>
                        </div>

                        <!-- Quick add -->
                        <div class="col-span-2 sm:col-span-2 lg:col-span-2">
                          <Button size="sm" class="w-full" @click="quickAdd(selectedProduct, variant)">
                            Agregar
                          </Button>
                        </div>

                        <!-- Expand toggle (mobile) -->
                        <div class="col-span-12 flex justify-end sm:hidden">
                          <button type="button" class="text-xs text-muted-foreground px-2 py-1"
                            @click="expandedVariant === idx ? expandedVariant = null : expandedVariant = idx"
                            :aria-expanded="expandedVariant === idx">
                            Detalles
                            <span :class="{ 'inline-block rotate-180': expandedVariant === idx }"
                              class="inline-block align-middle transition-transform">⌄</span>
                          </button>
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
    <TabsContent value="ventas">
      <Card>
        <CardHeader>
          <CardTitle>Resumen de ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col gap-2 max-h-56 lg:max-h-64 overflow-y-auto">
            <div v-for="prod in cartStore.cart" :key="prod.id" class="p-3 border rounded-lg">
              <div class="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-semibold text-sm lg:text-base truncate">
                    {{ prod.title }}
                    <span class="text-muted-foreground"> • {{ prod.variant.size }} • {{ prod.variant.color }}</span>
                  </p>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="text-xs text-muted-foreground">Cant.:</span>
                    <NumberField :default-value="prod.stock" :min="1" :max="prod.variant.stock" class="min-w-24">
                      <Label hidden>Cantidad</Label>
                      <NumberFieldContent>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                      </NumberFieldContent>
                    </NumberField>
                  </div>
                </div>
                <div class="flex items-center sm:flex-col lg:flex-row gap-2 sm:items-end sm:justify-end">
                  <p class="font-semibold">
                    {{ (prod.price * prod.stock).toLocaleString('es-CO', {
                      style: 'currency', currency: 'COP', minimumFractionDigits: 0
                    }) }}
                  </p>
                  <Button @click="cartStore.removeItem(prod.variant.id)" variant="destructive" size="sm">
                    <TrashIcon class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div class="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p class="text-base lg:text-xl font-bold">
              Total:
              {{ cartStore.totalPrice.toLocaleString('es-CO', {
                style: 'currency', currency: 'COP', minimumFractionDigits: 0
              }) }}
            </p>
            <div class="flex flex-col gap-2 md:flex-row">
              <Button @click="cartStore.emptyCart" variant="outline" class="w-full sm:w-auto">Cancelar</Button>
              <Button class="w-full sm:w-auto">Completar venta</Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </TabsContent>
  </Tabs>

  <Card class="min-h-screen lg:min-h-2/3 lg:hidden">
    <form class="w-full h-full flex flex-col" @submit="onSubmit">
      <CardHeader class="border-b shrink-0">
        <CardTitle>Agregar venta</CardTitle>
        <CardDescription>Agregar una venta a tu inventario</CardDescription>
      </CardHeader>

      <CardContent class="min-h-0 flex-1 p-4 lg:p-6">
        <div class="flex flex-col lg:flex-row gap-4 h-full">
          <!-- Search (Master) -->
          <!-- <aside class="flex flex-col gap-3 w-full lg:max-w-80 xl:max-w-96 lg:border-r lg:pr-4 min-h-0"> -->
          <!--   <!-- Mobile collapsible header once selected -->
          <!--   <div v-if="selectedProduct" class="lg:hidden"> -->
          <!--     <Button type="button" class="min-w-full justify-between" variant="outline" -->
          <!--       @click="searchOpen = !searchOpen"> -->
          <!--       <span class="font-medium text-sm truncate">{{ selectedProduct.title }}</span> -->
          <!--       <ChevronDown :class="{ 'rotate-180': searchOpen }" class="w-4 h-4 transition-transform" /> -->
          <!--     </Button> -->
          <!--   </div> -->
          <!---->
          <!--   <!-- Search body -->
          <!--   <div class="flex flex-col gap-3 overflow-hidden" -->
          <!--     :class="selectedProduct ? (searchOpen ? '' : 'hidden lg:flex') : ''"> -->
          <!--     <div class="flex gap-2"> -->
          <!--       <Input placeholder="Buscar producto..." v-model="searchTerm" class="text-sm flex-1" /> -->
          <!--       <Button v-if="selectedProduct" variant="outline" size="sm" class="hidden lg:inline-flex" -->
          <!--         @click="clearSelection"> -->
          <!--         Limpiar -->
          <!--       </Button> -->
          <!--     </div> -->
          <!---->
          <!--     <div class="min-h-32 max-h-64 lg:max-h-none overflow-auto rounded-lg border"> -->
          <!--       <div v-if="pending" class="p-3 text-xs text-muted-foreground">Buscando…</div> -->
          <!--       <div v-else-if="error" class="p-3 text-xs text-destructive">Error cargando productos</div> -->
          <!--       <div v-else-if="!filteredProducts?.length" class="p-3 text-xs text-muted-foreground">Sin resultados -->
          <!--       </div> -->
          <!---->
          <!--       <div v-for="product in filteredProducts" :key="product.id" -->
          <!--         class="p-2 hover:bg-accent cursor-pointer transition-colors text-sm" -->
          <!--         :class="{ 'bg-accent': selectedProduct?.id === product.id }" @click="goToItem('item-1')"> -->
          <!--         {{ product.title }} -->
          <!--       </div> -->
          <!--     </div> -->
          <!---->
          <!--     <!-- Desktop helper -->
          <!--     <div v-if="selectedProduct" class="hidden lg:flex"> -->
          <!--       <Button variant="outline" size="sm" @click="clearSelection">Borrar selección</Button> -->
          <!--     </div> -->
          <!--   </div> -->
          <!-- </aside> -->
          <Accordion v-model="openItem" type="single" class="w-full" collapsible>
            <AccordionItem value="item-0">
              <AccordionTrigger>{{ selectedProduct?.title ?? 'Producto' }}</AccordionTrigger>
              <AccordionContent>
                <div class="flex flex-col gap-3 overflow-hidden">
                  <div class="flex gap-2">
                    <Input placeholder="Buscar producto..." v-model="searchTerm" class="text-sm flex-1" />
                    <Button v-if="selectedProduct" variant="outline" size="sm" class="hidden lg:inline-flex"
                      @click="clearSelection">
                      Limpiar
                    </Button>
                  </div>

                  <div class="min-h-32 max-h-64 lg:max-h-none overflow-auto rounded-lg border">
                    <div v-if="pending" class="p-3 text-xs text-muted-foreground">Buscando…</div>
                    <div v-else-if="error" class="p-3 text-xs text-destructive">Error cargando productos</div>
                    <div v-else-if="!filteredProducts?.length" class="p-3 text-xs text-muted-foreground">Sin resultados
                    </div>

                    <div v-for="product in filteredProducts" :key="product.id"
                      class="p-2 hover:bg-accent cursor-pointer transition-colors text-sm"
                      :class="{ 'bg-accent': selectedProduct?.id === product.id }" @click="goToItem('item-1', product)">
                      {{ product.title }}
                    </div>
                  </div>

                  <!-- Desktop helper -->
                  <div v-if="selectedProduct" class="hidden lg:flex">
                    <Button variant="outline" size="sm" @click="clearSelection">Borrar selección</Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-1" v-if="selectedProduct">
              <AccordionTrigger>Variantes</AccordionTrigger>
              <AccordionContent>
                <section class="flex flex-col gap-4 w-full min-h-0 flex-1">
                  <!-- Variants panel -->
                  <div class="flex flex-col overflow-hidden flex-1 min-h-0">
                    <!-- Sticky product/context bar with quick filters -->
                    <div v-if="selectedProduct" class="sticky top-0 z-10 border-b">
                      <!-- <div class="flex items-center justify-between gap-2 px-2 py-2"> -->
                      <!--   <div class="flex gap-2 shrink-0"> -->
                      <!--     <Button variant="outline" size="sm" class="hidden lg:inline-flex" -->
                      <!--       @click="selectedProduct = undefined">Cambiar</Button> -->
                      <!--     <Button variant="outline" size="sm" class="lg:hidden" @click="searchOpen = !searchOpen"> -->
                      <!--       {{ searchOpen ? 'Ocultar' : 'Buscar' }} -->
                      <!--     </Button> -->
                      <!--   </div> -->
                      <!-- </div> -->

                      <!-- Quick filters row -->
                      <div class="px-2 pb-2 flex items-center gap-2 overflow-x-auto">
                        <!-- <Button type="button" size="sm" variant="outline" :class="{ 'bg-accent': showAvailableOnly }" -->
                        <!--   @click="showAvailableOnly = !showAvailableOnly"> -->
                        <!--   Solo disponibles -->
                        <!-- </Button> -->

                        <!-- Size chips -->
                        <div class="flex items-center gap-2">
                          <Button variant="ghost" v-for="size in sizes" :key="size" type="button"
                            class="px-2 py-1 rounded-full border text-xs"
                            :class="sizeFilter === size ? 'bg-accent' : ''" @click="toggleSize(size)">
                            {{ size }}
                          </Button>
                        </div>

                        <!-- Color chips -->
                        <div class="flex items-center gap-2">
                          <Button variant="ghost" v-for="color in colors" :key="color" type="button"
                            class="px-2 py-1 rounded-full border text-xs"
                            :class="colorFilter === color ? 'bg-accent' : ''" @click="toggleColor(color)">
                            {{ color }}
                          </Button>
                        </div>

                        <Button v-if="sizeFilter || colorFilter" type="button" size="sm" variant="ghost" class="ml-auto"
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
                    <div v-if="selectedProduct" class="flex flex-col gap-2 overflow-y-auto min-h-0 flex-1 px-1 py-1">
                      <div v-for="(variant, idx) in filteredVariants" :key="variant.id"
                        class=" border-b bg-card/40 hover:bg-card/60 transition-colors">
                        <!-- Compact row -->
                        <div class="grid grid-cols-12 items-center gap-2 p-2">
                          <div class="col-span-7 sm:col-span-6 lg:col-span-6 min-w-0">
                            <p class="text-sm font-medium truncate">
                              {{ variant.size }} • {{ variant.color }}
                            </p>
                            <p class="text-xs text-muted-foreground">Stock: {{ variant.stock }}</p>
                          </div>

                          <!-- Quantity -->
                          <div class="col-span-3 sm:col-span-3 lg:col-span-3 flex items-center justify-end">
                            <NumberField v-model="variantStockToAdd[variant.id]" :default-value="1" :min="1"
                              :max="variant.stock" class="min-w-24">
                              <Label hidden>Cantidad</Label>
                              <NumberFieldContent>
                                <NumberFieldDecrement />
                                <NumberFieldInput />
                                <NumberFieldIncrement />
                              </NumberFieldContent>
                            </NumberField>
                          </div>

                          <!-- Quick add -->
                          <div class="col-span-2 sm:col-span-2 lg:col-span-2">
                            <Button size="sm" class="w-full" @click="quickAdd(selectedProduct, variant)">
                              <PlusCircleIcon class="w-4 h-4" />
                            </Button>
                          </div>

                          <!-- Expand toggle (mobile) -->
                          <div class="col-span-12 flex justify-end sm:hidden">
                            <button type="button" class="text-xs text-muted-foreground px-2 py-1"
                              @click="expandedVariant === idx ? expandedVariant = null : expandedVariant = idx"
                              :aria-expanded="expandedVariant === idx">
                              Detalles
                              <span :class="{ 'inline-block rotate-180': expandedVariant === idx }"
                                class="inline-block align-middle transition-transform">⌄</span>
                            </button>
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

                </section>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" v-if="selectedProduct">

              <AccordionTrigger>Carrito</AccordionTrigger>
              <AccordionContent>
                <!-- Summary -->
                <div class="pt-3 lg:pt-4 w-full shrink-0 border-t">
                  <h3 class="text-base lg:text-2xl font-bold mb-2 lg:mb-3">Resumen de transacciones</h3>
                  <div class="flex flex-col gap-2 max-h-56 lg:max-h-64 overflow-y-auto">
                    <div v-for="prod in cartStore.cart" :key="prod.id" class="p-3 border rounded-lg">
                      <div class="flex flex-col sm:flex-row sm:justify-between gap-3">
                        <div class="min-w-0">
                          <p class="font-semibold text-sm lg:text-base truncate">
                            {{ prod.title }}
                            <span class="text-muted-foreground"> • {{ prod.variant.size }} • {{ prod.variant.color
                            }}</span>
                          </p>
                          <div class="flex items-center gap-2 mt-2">
                            <span class="text-xs text-muted-foreground">Cant.:</span>
                            <NumberField :default-value="prod.stock" :min="1" :max="prod.variant.stock"
                              class="min-w-24">
                              <Label hidden>Cantidad</Label>
                              <NumberFieldContent>
                                <NumberFieldDecrement />
                                <NumberFieldInput />
                                <NumberFieldIncrement />
                              </NumberFieldContent>
                            </NumberField>
                          </div>
                        </div>
                        <div class="flex items-center sm:flex-col lg:flex-row gap-2 sm:items-end sm:justify-end">
                          <p class="font-semibold">
                            {{ (prod.price * prod.stock).toLocaleString('es-CO', {
                              style: 'currency', currency: 'COP', minimumFractionDigits: 0
                            }) }}
                          </p>
                          <Button @click="cartStore.removeItem(prod.variant.id)" variant="destructive" size="sm">
                            <TrashIcon class="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <p class="text-base lg:text-xl font-bold">
                      Total:
                      {{ cartStore.totalPrice.toLocaleString('es-CO', {
                        style: 'currency', currency: 'COP', minimumFractionDigits: 0
                      }) }}
                    </p>
                    <div class="flex flex-col gap-2 md:flex-row">
                      <Button @click="cartStore.emptyCart" variant="outline" class="w-full sm:w-auto">Cancelar</Button>
                      <Button class="w-full sm:w-auto">Completar venta</Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </form>
  </Card>

</template>
