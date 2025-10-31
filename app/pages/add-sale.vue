<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import { useForm } from 'vee-validate'
import { toast } from '~/components/ui/toast'
import type { Product } from '~~/db/schema'

const searchTerm = ref('')
const debouncedSearchTerm = refDebounced(searchTerm, 500) // 300ms debounce
const selectedProduct = ref<Product>()
const selectedProductId = computed(() => selectedProduct.value?.id)


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
    console.log(values)
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
</script>


<template>
  <Card>

    <form class="w-full space-y-8" @submit="onSubmit">
      <CardHeader class="border-b">
        <CardTitle>Agregar venta</CardTitle>
        <CardDescription>Agregar una venta a tu inventario</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-row gap-4">
          <div class="flex flex-col gap-4 max-w-1/3 border-r pr-4">
            <Input placeholder="Buscar producto..." v-model="searchTerm" />
            <div>
              <div class="hover:cursor-pointer hover:bg-accent p-2 rounded-sm" v-for="product in data"
                @click="selectedProduct = product" :class="{ 'bg-accent': selectedProduct?.id === product.id }">
                {{ product.title }}
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-4">
            <h2 class="text-2xl">{{ selectedProduct?.title }}</h2>

            <div v-for="variant in variants" :key="variant.id">

              {{ variant.size }}
              {{ variant.color }}
              {{ variant.stock }}


              <ItemGroup>
                <template v-for="(_, index) in values.variants" :key="`new-${index}`">
                  <Item class="flex flex-col p-0 py-4 md:flex-row">
                    <ItemContent class="flex gap-4 md:flex-row ">
                      <FormField v-slot="{ componentField }" class="w-full" :name="`variants[${index}].size`">
                        <FormItem class="w-full">
                          <div class='flex gap-1 h-4'>
                            <FormLabel>Talla</FormLabel>
                            <FormMessage />
                          </div>
                          <FormControl>
                            <Input type="text" placeholder="Tamaño" v-bind="componentField" />
                          </FormControl>
                        </FormItem>
                      </FormField>

                      <FormField v-slot="{ componentField }" class="w-full" :name="`variants[${index}].color`">
                        <FormItem class="w-full">
                          <div class='flex gap-1 h-4'>
                            <FormLabel>Color</FormLabel>
                            <FormMessage />
                          </div>
                          <FormControl>
                            <Input type="text" placeholder="Color" v-bind="componentField" />
                          </FormControl>
                        </FormItem>
                      </FormField>

                      <FormField v-slot="{ componentField }" class="w-full" :name="`variants[${index}].stock`">
                        <FormItem class="w-full">
                          <div class='flex gap-1 h-4'>
                            <FormLabel>Stock</FormLabel>
                            <FormMessage />
                          </div>

                          <FormControl>
                            <Input type="number" step="1" placeholder="0" v-bind="componentField" />
                          </FormControl>
                        </FormItem>
                      </FormField>

                      <Button type="button" class="w-fit md:self-end" variant="ghost"
                        @click.prevent="removeVariant(index)">
                        <Trash2Icon class="text-destructive dark:text-destructive-foreground" />
                      </Button>
                    </ItemContent>
                  </Item>
                  <ItemSeparator v-if="index !== values.variants!.length - 1" />
                </template>
              </ItemGroup>
            </div>
          </div>
        </div>

      </CardContent>
      <CardFooter class="border-t flex flex-row justify-between">
        Total price: $
        <div class="flex flex-row gap-2">
          <Button variant="secondary">Cancelar</Button>
          <Button>Completar venta</Button>
        </div>
      </CardFooter>
    </form>
  </Card>
</template>
