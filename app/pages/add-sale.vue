<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import { useForm } from 'vee-validate'
import { toast } from '~/components/ui/toast'
import type { Product, ProductVariant } from '~~/db/schema'
import { TrashIcon } from 'lucide-vue-next'

const searchTerm = ref('')
const debouncedSearchTerm = refDebounced(searchTerm, 500) // 300ms debounce
const selectedProduct = ref<Product>()
const selectedProductId = computed(() => selectedProduct.value?.id)
const cartStore = useCartStore()


const { data, pending, error, refresh } =
  useFetch(() => `/api/products?search=${debouncedSearchTerm.value}`, {
    watch: [debouncedSearchTerm],
    lazy: true,
  })
$fetch('/api/dashboard/stats')

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

const variantStockToAdd = reactive({});
const variantQuantity = ref(0)
</script>


<template>
  <Card class="min-h-2/3">
    <form class="w-full space-y-8 h-full flex flex-col" @submit="onSubmit">
      <CardHeader class="border-b">
        <CardTitle>Agregar venta</CardTitle>
        <CardDescription>Agregar una venta a tu inventario</CardDescription>
      </CardHeader>
      <CardContent class="flex-1 min-h-0">
        <div class="flex flex-row gap-4 h-full">
          <div class="flex flex-col gap-4 max-w-1/3 border-r pr-4">
            <Input placeholder="Buscar producto..." v-model="searchTerm" />
            <div>
              <div class="hover:cursor-pointer hover:bg-accent p-2 rounded-sm" v-for="product in data"
                @click="selectedProduct = product" :class="{ 'bg-accent': selectedProduct?.id === product.id }">
                {{ product.title }}
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-4 w-full min-h-0">
            <div class="flex-1 min-h-0 overflow-y-auto">
              <div v-if="selectedProduct" class="border-b pb-4 mb-4">
                <h2 class="text-2xl">{{ selectedProduct?.title }}</h2>
                <span class="text-muted-foreground">Agrega las variantes para la venta</span>
              </div>

              <div class="flex flex-col gap-4">
                <div v-for="variant in variants" :key="variant.id" class="grid grid-cols-4 gap-4 text-muted-foreground">
                  <span>Tamaño: {{ variant.size }} </span>
                  <span>Color: {{ variant.color }}</span>
                  <span>Stock: {{ variant.stock }}</span>
                  <div class="flex flex-row gap-2">
                    <NumberField v-model="variantStockToAdd[variant.id]" :default-value="1" :min="1"
                      :max="variant.stock">
                      <Label hidden>Stock</Label>
                      <NumberFieldContent>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                      </NumberFieldContent>
                    </NumberField>
                    <Button @click="handleAddToCart(selectedProduct, variant, variantStockToAdd[variant.id])"
                      class="text-foreground">
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div class="border-t w-full overflow-y-auto min-h-2/6 max-h-2/6">
              <h3 class="text-2xl bolder">Resumen de transacciones</h3>
              <div v-for="prod in cartStore.cart" :key="prod.id" class="py-2 px-4">
                <div class="flex flex-row justify-between">
                  <div>
                    <p>
                      <span class="font-bold">{{ prod.title }} </span>
                      - {{ prod.variant.size }} - {{ prod.variant.color }}
                    </p>
                    <p class="text-muted-foreground">
                      Cantidad: {{ prod.stock }}
                      <NumberField :default-value="1" :min="1" :max="prod.variant.stock">
                        <Label hidden>Stock</Label>
                        <NumberFieldContent>
                          <NumberFieldDecrement />
                          <NumberFieldInput />
                          <NumberFieldIncrement />
                        </NumberFieldContent>
                      </NumberField>
                    </p>
                  </div>
                  <div class="flex flex-row gap-2 items-center">
                    <p>
                      {{ (prod.price * prod.stock).toLocaleString('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0
                      }) }}
                    </p>
                    <Button @click="cartStore.removeItem(prod.variant.id)" variant="destructive">
                      <TrashIcon />
                    </Button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter class="border-t flex flex-row justify-between">
        Total: {{ cartStore.totalPrice.toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0
        }) }}
        <div class="flex flex-row gap-2">
          <Button @click="cartStore.emptyCart" variant="outline">Cancelar</Button>
          <Button>Completar venta</Button>
        </div>
      </CardFooter>
    </form>
  </Card>
</template>
