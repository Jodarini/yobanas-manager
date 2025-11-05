<script setup lang="ts">

import { cn } from '@/lib/utils';
import { useForm } from 'vee-validate';
import { Check, Plus, ChevronsUpDown } from 'lucide-vue-next';
import { toTypedSchema } from '@vee-validate/zod';
import {
  type insertProductSchema,
  type updateProductSchema,
  updateProductSchema2,
  type InsertProduct,
} from '~~/db/schema';
import { useToast } from './ui/toast';

const props = defineProps<{
  brands: string[];
  categories: string[];
  initialValues?: InsertProduct;
  isDeleting?: boolean;
  validationSchema: typeof insertProductSchema | typeof updateProductSchema;
  variant: 'ADD' | 'EDIT';
}>();

const emit = defineEmits<{
  delete: [];
  submit: [values: typeof values];
}>();

const formSchema = toTypedSchema(updateProductSchema2);

const { handleSubmit, values, setFieldValue, resetForm, isSubmitting } =
  useForm({
    validationSchema: formSchema,
    initialValues: props.initialValues || {
      title: '',
      description: 'test',
      price: 1000,
      category: ['test'],
      brand: 'test',
    },
  });

const { toast } = useToast();

const onSubmit = handleSubmit(
  async (values) => {
    console.log(values)
    $fetch(`/api/product/:id/addProduct`, {
      method: 'put',
      body: values,
    })
    if (props.variant === 'ADD') {
      resetForm();
    }
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

const brandOpen = ref(false);
const brandSearchTerm2 = ref('');
const brandSearchTerm = ref('');
const categoryOpen = ref(false);
const categorySearchTerm = ref('');

const filteredBrands = computed(() => {
  if (!brandSearchTerm.value) return props.brands;
  return props.brands.filter((b) =>
    b.toLowerCase().includes(brandSearchTerm.value.toLowerCase())
  );
});

const filteredCategories = computed(() => {
  if (!categorySearchTerm.value) return props.categories;
  return props.categories.filter((c) =>
    c.toLowerCase().includes(categorySearchTerm.value.toLowerCase())
  );
});

const createBrand = () => {
  setFieldValue('brand', brandSearchTerm2.value);
  brandOpen.value = false;
};

const createCategory = () => {
  const currentValue = values.category || [];
  setFieldValue('category', [...currentValue, categorySearchTerm.value]);
  categorySearchTerm.value = '';
};

function handleCategoryToggle(category: string) {
  const currentValue = values.category || [];
  const isSelected = currentValue.includes(category);

  const next = isSelected
    ? currentValue.filter((v) => v !== category)
    : [...currentValue, category];

  setFieldValue('category', next);
}


</script>

<template>


  <form class="w-full space-y-8" @submit.prevent="onSubmit">
    <Card>
      <!-- Product Info Fields -->
      <CardHeader>
        <CardTitle>Información del Producto</CardTitle>
      </CardHeader>

      <CardContent>
        <div class="mb-4 flex flex-col gap-4 md:flex-row">
          <FormField v-slot="{ componentField }" class="flex-1" name="title">
            <FormItem class="w-full">
              <div class='flex gap-1 h-4'>
                <FormLabel>Nombre</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Input type="text" placeholder="Nombre del producto" v-bind="componentField" />
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ value }" class="flex-1" name="price">
            <FormItem class="w-full">

              <div class='flex gap-1 h-4'>
                <FormLabel>Precio</FormLabel>
                <FormMessage />
              </div>
              <NumberField class="gap-2" :min="0" :format-options="{
                style: 'currency',
                currency: 'COP',
                currencyDisplay: 'symbol',
                currencySign: 'accounting',
                trailingZeroDisplay: 'stripIfInteger',
                useGrouping: true,
                signDisplay: 'auto',
              }" :model-value="value" @update:model-value="
                (v) => {
                  if (v) {
                    setFieldValue('price', v);
                  } else {
                    setFieldValue('price', 0);
                  }
                }
              ">
                <NumberFieldContent>
                  <NumberFieldDecrement />
                  <FormControl>
                    <NumberFieldInput />
                  </FormControl>
                  <NumberFieldIncrement />
                </NumberFieldContent>
              </NumberField>

            </FormItem>
          </FormField>
        </div>

        <div class="grid w-full items-center gap-4">
          <FormField v-slot="{ componentField }" name="brand">
            <FormItem class="flex flex-col">
              <div class='flex gap-1 h-4'>
                <FormLabel>Marca</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Popover v-model:open="brandOpen">
                  <PopoverTrigger as-child>
                    <Button type="button" variant="outline" class="w-full justify-between">
                      {{ componentField.modelValue || 'Seleccione una marca' }}
                      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="p-0">
                    <Command>
                      <CommandInput placeholder="Search brand..." v-model="brandSearchTerm2"
                        @keydown.enter.prevent="createBrand" />
                      <div v-if="
                        brandSearchTerm2 &&
                        !filteredBrands.includes(brandSearchTerm2)
                      "
                        class="relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none">
                        <Button type="button" variant="ghost" size="sm" class="w-full justify-start"
                          @click="createBrand">
                          <Plus class="mr-2 h-4 w-4" />
                          Crear "{{ brandSearchTerm2 }}"
                        </Button>
                      </div>
                      <CommandList>
                        <CommandEmpty>No se encontraron marcas...</CommandEmpty>
                        <CommandGroup>
                          <CommandItem v-for="brand in filteredBrands" :key="brand" :value="brand"
                            @select="() => componentField.onChange(brand)">
                            <span>{{ brand }}</span>
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ value }" name="category">
            <FormItem class="flex flex-col">
              <div class='flex gap-1 h-4'>
                <FormLabel>Categorías</FormLabel>
                <FormMessage />
              </div>
              <Popover v-model:open="categoryOpen">
                <PopoverTrigger as-child>
                  <FormControl>
                    <Button type="button" variant="outline" role="combobox" :aria-expanded="categoryOpen"
                      class="h-auto min-h-10 w-full justify-start">
                      <div class="flex flex-1 flex-wrap gap-1.5">
                        <template v-if="!value || value.length === 0">
                          <span class="text-muted-foreground">
                            Seleccionar categorías...
                          </span>
                        </template>
                        <template v-else>
                          <Badge v-for="item in value" :key="`${item}-badges`" variant="secondary" class="gap-1">
                            <span>
                              {{ item }}
                            </span>
                          </Badge>
                        </template>
                      </div>
                      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent class="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar categorías..." v-model="categorySearchTerm" />

                    <div v-if="
                      categorySearchTerm &&
                      !filteredCategories.includes(categorySearchTerm)
                    "
                      class="relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none">
                      <Button type="button" variant="ghost" size="sm" class="w-full justify-start"
                        @click="createCategory">
                        <Plus class="mr-2 h-4 w-4" />
                        Crear "{{ categorySearchTerm }}"
                      </Button>
                    </div>
                    <CommandList>
                      <CommandEmpty>
                        <p class="text-muted-foreground py-6 text-center text-sm">
                          No se encontraron categorías
                        </p>
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem v-for="category in filteredCategories" :key="category!" :value="category!"
                          @select="handleCategoryToggle(category!)">
                          <Check :class="cn(
                            'mr-2 h-4 w-4',
                            value?.includes(category)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )
                            " />
                          {{ category }}
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" class="w-full" name="description">
            <FormItem class="w-full">
              <div class='flex gap-1 h-4'>
                <FormLabel>Descripción</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Textarea type="text" placeholder="Descripción" v-bind="componentField" />
              </FormControl>
            </FormItem>
          </FormField>
        </div>

        <Button type="submit" class="" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="flex items-center">
            <Spinner class="mr-2" />
            {{
              props.variant === 'EDIT'
                ? 'Actualizando producto...'
                : 'Creando producto...'
            }}
          </span>
          <span v-else>
            {{
              props.variant === 'EDIT' ? 'Actualizar producto' : 'Crear producto'
            }}
          </span>
        </Button>
      </CardContent>

    </Card>
  </form>
</template>
