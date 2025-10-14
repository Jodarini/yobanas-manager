<script setup lang="ts">
import { z } from 'zod';
import { addProductSchema, insertProductSchema, type InsertProduct } from '~/db/schema';
import { useToast } from '@/components/ui/toast/use-toast';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { Check, ChevronsUpDown, X } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox';
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from '@/components/ui/tags-input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const { toast } = useToast();
const store = useProductsStore();

if (!store.products) {
  await store.fetchProducts();
}

const formSchema = toTypedSchema(insertProductSchema);
type FormValues = z.infer<typeof addProductSchema>;

const { handleSubmit, values, setFieldValue, resetForm } = useForm<FormValues>({
  validationSchema: formSchema,
  initialValues: {
    productInfo: {
      title: 'title',
      brand: 'brand',
      price: 1000,
      description: 'description',
      category: []
    },
    variantInfo: [{ size: 'SIZE', stock: 10, color: 'COLOR' }],
  },
});

const brands = store.productBrands;
const categories = store.productCategories;
const newProduct = ref(values);
const searchTerm = ref('');

const onSubmit = handleSubmit(
  async (values) => {
    const product: InsertProduct = { ...values };
    try {
      store.addProduct(product);
      toast({ title: 'Producto agregado exitosamente' });
      resetForm();
    } catch (err) {
      toast({ variant: 'destructive', title: `${err}` });
      console.error(err);
    }
  },
  ({ errors, values }) => {
    console.error('❌ Validation failed!');
    console.error('Errors:', errors);
    console.error('Current values:', values);
  }
);

const addVariant = () => {
  const currentVariants = values.variantInfo || [];
  const newVariant = { title: '', description: '', price: 0, stock: 0 };
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
  <form class="w-full" @submit.prevent="onSubmit">
    <!-- Product Info Fields -->
    <div class="space-y-4">
      <h3 class="text-xl font-semibold">Agregar producto</h3>

      <div class="flex flex-col gap-4 md:flex-row">
        <FormField v-slot="{ componentField }" class="flex-1" name="productInfo.title">
          <FormItem class="w-full">
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Nombre del producto" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, componentField }" class="flex-1" name="productInfo.brand">
          <FormItem class="flex w-full flex-col">
            <FormLabel>Marca</FormLabel>
            <Combobox v-bind="componentField">
              <FormControl class="w-full">
                <ComboboxAnchor>

                  <div
                    class="min-h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-1 focus-within:ring-ring">
                    <div class="relative min-w-full w-full max-w-sm items-center">
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

        <FormField v-slot="{ componentField, value }" class="flex-1" name="productInfo.category">
          <FormItem class="flex w-full flex-col">
            <FormLabel>Categorías</FormLabel>

            <FormControl>
              <Combobox :model-value="value || []" @update:model-value="(next) => {
                // next can be string or array depending on emitter; normalize to array
                const arr = Array.isArray(next) ? next : (next == null ? [] : [String(next)])
                setFieldValue('productInfo.category', arr)
              }" v-model:search-term="searchTerm" multiple>
                <ComboboxAnchor class="relative w-full">
                  <div class="min-h-10 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm">
                    <div class="flex items-center gap-2">
                      <!-- Render chips from value; no binding back to field -->
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

                        <!-- The only editable input goes through ComboboxInput, not TagsInput -->
                        <ComboboxInput :value="''" :display-value="() => ''" placeholder="Seleccione categorías..."
                          class="m-0 min-w-[100px] flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                          @keydown.enter.prevent />
                      </div>

                      <ComboboxTrigger class="shrink-0 rounded-md p-1.5">
                        <ChevronsUpDown class="h-4 w-4" />
                      </ComboboxTrigger>
                    </div>
                  </div>
                </ComboboxAnchor>

                <ComboboxList
                  class="z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                  <ComboboxEmpty class="py-6 text-center text-sm text-muted-foreground">
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
                    " class="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm">
                      <span class="mr-1 grid h-4 w-4 place-items-center">
                        <Check class="h-4 w-4"
                          :class="(value || []).includes(category) ? 'opacity-100' : 'opacity-0'" />
                      </span>
                      <span class="truncate">{{ category }}</span>
                    </ComboboxItem>
                  </ComboboxGroup>
                </ComboboxList>
              </Combobox>
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

      <div v-for="(variant, index) in newProduct.variantInfo" :key="variant.id"
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

    <Button type="submit" class="mt-6 self-end">Agregar producto</Button>
  </form>
</template>
