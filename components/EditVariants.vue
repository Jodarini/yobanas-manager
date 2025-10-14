<script setup lang="ts">
import { editProductSchema2 } from '~/db/schema';
import { useToast } from '@/components/ui/toast/use-toast';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const { toast } = useToast();
const route = useRoute();
const searchTerm = ref('');

const formSchema = toTypedSchema(editProductSchema2);

const store = useProductsStore();

if (!store.products) {
  await store.fetchProducts();
}

const categories = store.productCategories
const brands = store.productBrands
const { data: productData } = await store.fetchProduct(+route.params.id)


const { handleSubmit, values, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    productInfo: {
      id: +route.params.id,
      title: productData.value?.productInfo?.title || '',
      description: productData.value?.productInfo?.description || '',
      price: productData.value?.productInfo?.price || 0,
      brand: productData.value?.productInfo?.brand,
      category: productData.value?.productInfo?.category
    },
    variantInfo: productData.value?.variantInfo || [],
  },
});

const onSubmit = handleSubmit(
  // TODO: Implement dirty field validation
  async (values) => {
    try {
      const newProduct = ref(values);
      console.log(newProduct)
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
    toast({ variant: 'destructive', title: 'Error actualizando el producto', description: `La validación falló ${JSON.stringify(errors)}` })
    // This runs when validation FAILS
    console.error('❌ Validation failed!');
    console.error('Errors:', errors);
    console.error('Current values:', values);
  }
);

const addVariant = () => {
  const currentVariants = values.variantInfo || [];
  const newVariant = {
    title: '',
    description: '',
    price: 0,
    stock: 0,
  };
  setFieldValue('variantInfo', [newVariant, ...currentVariants]);
};

const removeVariant = (index: number) => {
  const currentVariants = values.variantInfo || [];
  const newVariants = [...currentVariants];
  newVariants.splice(index, 1);
  setFieldValue('variantInfo', newVariants);
};
</script>
<template>
  <form class="w-full" @submit="onSubmit">
    <!-- Product Info Fields -->
    <div class="space-y-4">
      <h3 class="text-xl font-semibold">Información del Producto</h3>

      <div class="flex gap-4">
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

      <FormField v-slot="{ value, componentField }" class="flex-1" name="productInfo.brand">
        <FormItem class="flex w-full flex-col">
          <FormLabel>Marca</FormLabel>
          <Combobox v-bind="componentField">
            <FormControl class="w-full">
              <ComboboxAnchor>
                <div
                  class="min-h-10 rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-1 focus-within:ring-ring">
                  <div class="relative min-w-full max-w-sm items-center">
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
            <Combobox :model-value="value || []" @update:model-value="(next) => {
              const arr = Array.isArray(next) ? next : (next == null ? [] : [String(next)])
              setFieldValue('productInfo.category', arr)
            }" v-model:search-term="searchTerm" multiple>
              <ComboboxAnchor class="relative w-full">
                <div class="min-h-10 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm">
                  <div class="flex items-center gap-2">
                    <div class="flex flex-1 flex-wrap items-center gap-1.5">
                      <template v-for="item in value || []" :key="`cat-${item}`">
                        <span
                          class="inline-flex items-center gap-1 rounded-md bg-secondary/70 px-1.5 py-0.5 text-secondary-foreground">
                          <span class="text-[12px]">{{ item }}</span>
                          <button type="button" class="grid h-4 w-4 place-items-center rounded-[4px]" @click.stop="
                            setFieldValue(
                              'productInfo.category',
                              (value || []).filter(v => v !== item)
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
                      const curr = Array.isArray(value) ? value : []
                      const has = curr.includes(category)
                      const next = has ? curr.filter(v => v !== category) : [...curr, category]
                      setFieldValue('productInfo.category', next)
                    }
                  ">
                    <Check class="h-4 w-4" :class="(value || []).includes(category) ? 'opacity-100' : 'opacity-0'" />
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

    <!-- Variants Section -->
    <div class="mt-8 space-y-4">
      <div class="flex justify-between">
        <h3 class="text-xl font-semibold">Variantes</h3>
        <Button @click.prevent="addVariant">Agregar variante</Button>
      </div>

      <div v-for="(variant, index) in productData.variantInfo" :key="variant.id"
        class="space-y-4 rounded-lg bg-gray-800/8 p-4">
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
          <Button class="w-fit self-end" variant="destructive" @click.prevent="removeVariant(index)">
            X
          </Button>
        </div>
      </div>
    </div>

    <Button type="submit" class="mt-6 self-end">Actualizar producto</Button>
  </form>
</template>
