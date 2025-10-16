<script setup lang="ts">
import { editProductSchema2, type InsertProduct } from '~/db/schema';
import { useToast } from '@/components/ui/toast/use-toast';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { Check, ChevronsUpDown, TrashIcon, Trash2Icon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';


const props = defineProps<{
  product: InsertProduct;
}>();

const productData = props.product;
const { toast } = useToast();
const route = useRoute();
const searchTerm = ref('');
const store = useProductsStore()

const { data, pending, error, refresh } = await useFetch('/api/products', {
  key: 'products',
  lazy: true,
});

const categories = computed(() => {
  const cats = data.value?.flatMap((product) => product.category);
  return [...new Set(cats)].sort();
});

const brands = computed(() => {
  if (!data.value) return []
  return [...new Set(data.value.map(product => product.brand))].sort()
})

const formSchema = toTypedSchema(editProductSchema2);

const currentVariants = ref(productData?.variantInfo);

const { handleSubmit, values, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    productInfo: {
      id: +route.params.id,
      title: productData.productInfo?.title || '',
      description: productData.productInfo?.description || '',
      price: productData.productInfo?.price || 0,
      brand: productData.productInfo?.brand,
      category: productData.productInfo?.category,
    },
    variantInfo: productData.variantInfo || [],
  },
});

const onSubmit = handleSubmit(
  // TODO: Implement dirty field validation
  async (values) => {
    try {
      const newProduct = ref(values);
      await $fetch(`/api/product/${route.params.id}`, {
        method: 'put',
        body: newProduct.value,
      });

      toast({
        title: 'Producto actualizado exitosamente',
      });
      await refreshNuxtData('product');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: `${err}`,
      });
      console.error(err);
    }
  },
  ({ errors, values }) => {
    toast({
      variant: 'destructive',
      title: 'Error actualizando el producto',
      description: `La validación falló ${JSON.stringify(errors)}`,
    });
    // This runs when validation FAILS
    console.error('❌ Validation failed!');
    console.error('Errors:', errors);
    console.error('Current values:', values);
  }
);

const addVariant = () => {
  currentVariants.value = [...values.variantInfo]
  const newVariant = { id: Math.floor(Math.random() * 1000000), size: '', color: '', stock: 0 };
  currentVariants.value.unshift(newVariant)
  setFieldValue('variantInfo', currentVariants.value);
};

const removeVariant = (index: number) => {
  currentVariants.value = [...values.variantInfo]
  currentVariants.value.splice(index, 1);
  setFieldValue('variantInfo', currentVariants.value);
};

const deleteProduct = async (index: number) => {
  try {
    // TODO: add user confirmation
    store.deleteProduct(index);
    toast({ title: 'ELemento eliminado' });
    navigateTo('/');
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Algo anduvo mal',
    });
  }
};
</script>

<template>

  <form class="w-full space-y-8" @submit="onSubmit">
    <Card>
      <!-- Product Info Fields -->
      <CardHeader>
        <CardTitle>Información del Producto</CardTitle>
      </CardHeader>

      <CardContent>

        <div class="flex gap-4 mb-4">
          <FormField v-slot="{ componentField }" class="flex-1" name="productInfo.title">
            <FormItem class="w-full">
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Nombre del producto" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" class="flex-1" name="productInfo.price">
            <FormItem class="w-full">
              <FormLabel>Precio</FormLabel>
              <FormControl>
                <Input type="number" step="1000" placeholder="Precio" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <div class="grid items-center w-full gap-4">
          <FormField v-slot="{ value, componentField }" class="flex-1" name="productInfo.brand">
            <FormItem class="flex w-full flex-col">
              <FormLabel>Marca</FormLabel>
              <Combobox v-bind="componentField">
                <FormControl class="w-full">
                  <ComboboxAnchor>
                    <div
                      class="border-input bg-background ring-offset-background focus-within:ring-ring min-h-10 rounded-md border px-2 py-2 text-sm focus-within:ring-1 focus-within:outline-none">
                      <div class="relative max-w-sm min-w-full items-center">
                        <ComboboxInput :value="value" :display-value="(val) => val?.name ?? ''"
                          placeholder="Seleccione una marca..." />
                        <ComboboxTrigger class="absolute inset-y-0 end-0 flex items-center justify-center px-3">
                          <ChevronsUpDown class="text-muted-foreground size-4" />
                        </ComboboxTrigger>
                      </div>
                    </div>
                  </ComboboxAnchor>
                </FormControl>
                <ComboboxList>
                  <ComboboxEmpty>Nothing found.</ComboboxEmpty>
                  <ComboboxGroup>
                    <ComboboxItem v-for="opt in brands" :key="opt" :value="opt"
                      @select="() => setFieldValue('productInfo.brand', opt)">
                      {{ opt }}
                      <ComboboxItemIndicator>
                        <Check class="ml-auto h-4 w-4" />
                      </ComboboxItemIndicator>
                    </ComboboxItem>
                  </ComboboxGroup>
                </ComboboxList>
              </Combobox>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ value }" class="flex-1" name="productInfo.category">
            <FormItem class="flex w-full flex-col">
              <FormLabel>Categorías</FormLabel>

              <FormControl>
                <Combobox :model-value="value || []" @update:model-value="
                  (next) => {
                    const arr = Array.isArray(next)
                      ? next
                      : next == null
                        ? []
                        : [String(next)];
                    setFieldValue('productInfo.category', arr);
                  }
                " v-model:search-term="searchTerm" multiple>
                  <ComboboxAnchor class="relative w-full">
                    <div class="border-input bg-background min-h-10 w-full rounded-md border px-2 py-1.5 text-sm">
                      <div class="flex items-center gap-2">
                        <div class="flex flex-1 flex-wrap items-center gap-1.5">
                          <template v-for="item in value || []" :key="`cat-${item}`">
                            <span
                              class="bg-secondary/70 text-secondary-foreground inline-flex items-center gap-1 rounded-md px-1.5 py-0.5">
                              <span class="text-[12px]">{{ item }}</span>
                              <button type="button" class="grid h-4 w-4 place-items-center rounded-[4px]" @click.stop="
                                setFieldValue(
                                  'productInfo.category',
                                  (value || []).filter((v) => v !== item)
                                )
                                " aria-label="Eliminar">
                                ×
                              </button>
                            </span>
                          </template>

                          <ComboboxInput :value="''" :display-value="() => ''" placeholder="Seleccione categorías..."
                            @keydown.enter.prevent />
                        </div>

                        <ComboboxTrigger class="shrink-0 rounded-md p-1.5">
                          <ChevronsUpDown class="h-4 w-4" />
                        </ComboboxTrigger>
                      </div>
                    </div>
                  </ComboboxAnchor>

                  <ComboboxList>
                    <ComboboxEmpty class="">
                      No se encontraron resultados
                    </ComboboxEmpty>

                    <ComboboxGroup>
                      <ComboboxItem v-for="category in categories" :key="`opt-${category}`" :value="category" @select="
                        () => {
                          const curr = Array.isArray(value) ? value : [];
                          const has = curr.includes(category);
                          const next = has
                            ? curr.filter((v) => v !== category)
                            : [...curr, category];
                          setFieldValue('productInfo.category', next);
                        }
                      ">
                        <Check class="h-4 w-4" :class="(value || []).includes(category)
                          ? 'opacity-100'
                          : 'opacity-0'
                          " />
                        <span class="truncate">{{ category }}</span>
                      </ComboboxItem>
                    </ComboboxGroup>
                  </ComboboxList>
                </Combobox>
              </FormControl>

              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" class="w-full" name="productInfo.description">
            <FormItem class="w-full">
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea type="text" placeholder="Descripción" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

        </div>
      </CardContent>
    </Card>

    <!-- Variants Section -->
    <Card>
      <CardHeader>
        <div class="flex justify-between">
          <CardTitle>Variantes</CardTitle>
          <Button @click.prevent="addVariant">Agregar variante</Button>
        </div>
      </CardHeader>


      <CardContent v-for="(variant, index) in currentVariants" :key="variant.id">
        <div class="flex flex-col gap-4 md:flex-row">
          <FormField v-slot="{ componentField }" class="w-full" :name="`variantInfo[${index}].size`">
            <FormItem class="w-full">
              <FormLabel>Tamaño</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Tamaño" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" class="w-full" :name="`variantInfo[${index}].color`">
            <FormItem class="w-full">
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Color" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" class="w-full" :name="`variantInfo[${index}].stock`">
            <FormItem class="w-full">
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input type="number" step="1" placeholder="0" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <Button class="w-fit self-end" variant="ghost" @click.prevent="removeVariant(index)">
            <Trash2Icon class="text-red-400" />
          </Button>
        </div>
      </CardContent>
    </Card>

    <div class="flex justify-end gap-4 max-h-fit">
      <Button variant="destructive" class="" @click.prevent="deleteProduct(+route.params.id)">
        Eliminar producto
      </Button>
      <Button type="submit" class="">Actualizar producto</Button>
    </div>
  </form>
</template>
