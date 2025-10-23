<script setup lang="ts">
  import { insertProductSchema, type InsertProduct } from '~/db/schema';
  import { useToast } from '@/components/ui/toast/use-toast';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import {
    PlusCircleIcon,
    Trash2Icon,
    Check,
    ChevronsUpDown,
    Plus,
    X,
  } from 'lucide-vue-next';
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from '@/components/ui/popover';
  import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from '@/components/ui/command';
  import { Spinner } from '@/components/ui/spinner';
  import { Button } from '@/components/ui/button';
  import { Badge } from '@/components/ui/badge';
  import { cn } from '@/lib/utils';

  const store = useProductsStore();

  const { toast } = useToast();

  const { data } = await useFetch('/api/products', {
    key: 'products',
    lazy: true,
  });

  const categoriesList = ref<string[]>([
    ...new Set(data.value?.flatMap((product) => product.category)),
  ]);
  const brandsList = ref<string[]>([
    ...new Set(data.value?.map((product) => product.brand)),
  ]);

  const formSchema = toTypedSchema(insertProductSchema);

  const { handleSubmit, values, setFieldValue, resetForm, isSubmitting } =
    useForm({
      validationSchema: formSchema,
      initialValues: {
        //   title: 'test',
        //   description: 'test',
        //   price: 1000,
        //   category: ['test'],
        //   brand: 'test',
        variants: [{ size: '', stock: 0, color: '' }],
      },
    });

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
    const currentVariants = values.variants || [];
    const newVariant = {
      id: Math.floor(Math.random() * 1000000),
      size: '',
      color: '',
      stock: 0,
    };
    setFieldValue('variants', [...currentVariants, newVariant]);
  };

  const removeVariant = (index: number) => {
    const currentVariants = [...(values.variants || [])];
    currentVariants.splice(index, 1);
    setFieldValue('variants', currentVariants);
  };

  const brandOpen = ref(false);
  const brandSearchTerm = ref('');

  const filteredBrands = computed(() => {
    if (!brandSearchTerm.value) return brandsList.value;
    return brandsList.value.filter((b) =>
      b.toLowerCase().includes(brandSearchTerm.value.toLowerCase())
    );
  });

  // Category Management - Multi Select with Create
  const categoryOpen = ref(false);
  const categorySearchTerm = ref('');

  const filteredCategories = computed(() => {
    if (!categorySearchTerm.value) return categoriesList.value;
    return categoriesList.value.filter((c) =>
      c.toLowerCase().includes(categorySearchTerm.value.toLowerCase())
    );
  });

  function handleCategoryToggle(category: string) {
    const currentValue = values.category || [];
    const isSelected = currentValue.includes(category);

    const next = isSelected
      ? currentValue.filter((v) => v !== category)
      : [...currentValue, category];

    setFieldValue('category', next);
  }

  function handleCategoryRemove(category: string) {
    const currentValue = values.category || [];
    setFieldValue(
      'category',
      currentValue.filter((v) => v !== category)
    );
  }

  const brandSearchTerm2 = ref('');
  const createBrand = () => {
    setFieldValue('brand', brandSearchTerm2.value);
    brandOpen.value = false;
  };

  const createCategory = () => {
    const currentValue = values.category || [];
    setFieldValue('category', [...currentValue, categorySearchTerm.value]);
    categorySearchTerm.value = '';
  };
</script>

<template>
  <form class="flex w-full flex-col gap-4" @submit.prevent="onSubmit">
    <!-- Product Info Fields -->
    <Card>
      <CardHeader>
        <CardTitle>Agregar producto</CardTitle>
      </CardHeader>

      <CardContent>
        <div class="mb-4 flex flex-col gap-4 md:flex-row">
          <FormField v-slot="{ componentField }" class="flex-1" name="title">
            <FormItem class="w-full">
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Nombre del producto"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ value }" class="flex-1" name="price">
            <FormItem class="w-full">
              <FormLabel>Precio</FormLabel>
              <NumberField
                class="gap-2"
                :min="0"
                :step="1000"
                :format-options="{
                  style: 'currency',
                  currency: 'COP',
                  currencyDisplay: 'code',
                  currencySign: 'accounting',
                }"
                :model-value="value"
                @update:model-value="
                  (v) => {
                    if (v) {
                      setFieldValue('price', v);
                    } else {
                      setFieldValue('price', undefined);
                    }
                  }
                "
              >
                <NumberFieldContent>
                  <NumberFieldDecrement />
                  <FormControl>
                    <NumberFieldInput />
                  </FormControl>
                  <NumberFieldIncrement />
                </NumberFieldContent>
              </NumberField>
              <!-- <FormControl>
                <Input
                  type="number"
                  step="1000"
                  placeholder="Precio"
                  v-bind="componentField"
                />
              </FormControl> -->
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <div class="grid w-full items-center gap-4">
          <FormField v-slot="{ componentField }" name="brand">
            <FormItem class="flex flex-col">
              <FormLabel>Marca</FormLabel>
              <FormControl>
                <Popover v-model:open="brandOpen">
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      class="text-muted-foreground w-full justify-between"
                    >
                      {{ componentField.modelValue || 'Seleccione una marca' }}
                      <ChevronsUpDown
                        class="ml-2 h-4 w-4 shrink-0 opacity-50"
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="p-0">
                    <Command
                      v-model:search-term="brandSearchTerm2"
                      @keydown.enter.prevent="createBrand"
                    >
                      <CommandInput placeholder="Search brand..." />

                      <div
                        v-if="
                          brandSearchTerm2 &&
                          !filteredBrands.includes(brandSearchTerm2)
                        "
                        class="relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          class="w-full justify-start"
                          @click="createBrand"
                        >
                          <Plus class="mr-2 h-4 w-4" />
                          Crear "{{ brandSearchTerm2 }}"
                        </Button>
                      </div>
                      <CommandList>
                        <CommandEmpty>No se encontraron marcas...</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            v-for="brand in filteredBrands"
                            :key="brand"
                            :value="brand"
                            @select="() => componentField.onChange(brand)"
                          >
                            <span>{{ brand }}</span>
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ value }" name="category">
            <FormItem class="flex flex-col">
              <FormLabel>Categorías</FormLabel>
              <Popover v-model:open="categoryOpen">
                <PopoverTrigger as-child>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      :aria-expanded="categoryOpen"
                      class="h-auto min-h-10 w-full justify-start"
                    >
                      <div class="flex flex-1 flex-wrap gap-1.5">
                        <template v-if="!value || value.length === 0">
                          <span class="text-muted-foreground">
                            Seleccionar categorías...
                          </span>
                        </template>
                        <template v-else>
                          <Badge
                            v-for="item in value"
                            :key="`${item}-badges-edit`"
                            variant="secondary"
                            class="gap-1"
                          >
                            {{ item }}
                            <button
                              type="button"
                              class="hover:bg-secondary-foreground/20 ml-1 rounded-sm p-0.5"
                              @click.stop="handleCategoryRemove(item)"
                            >
                              <X class="h-3 w-3" />
                            </button>
                          </Badge>
                        </template>
                      </div>
                      <ChevronsUpDown
                        class="ml-2 h-4 w-4 shrink-0 opacity-50"
                      />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent class="w-full p-0" align="start">
                  <Command v-model:search-term="categorySearchTerm">
                    <CommandInput placeholder="Buscar categorías..." />

                    <div
                      v-if="
                        categorySearchTerm &&
                        !filteredCategories.includes(categorySearchTerm)
                      "
                      class="relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        class="w-full justify-start"
                        @click="createCategory"
                      >
                        <Plus class="mr-2 h-4 w-4" />
                        Crear "{{ categorySearchTerm }}"
                      </Button>
                    </div>
                    <CommandList>
                      <CommandEmpty>
                        <p
                          class="text-muted-foreground py-6 text-center text-sm"
                        >
                          No se encontraron categorías
                        </p>
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          v-for="category in filteredCategories"
                          :key="category"
                          :value="category"
                          @select="handleCategoryToggle(category)"
                        >
                          <Check
                            :class="
                              cn(
                                'mr-2 h-4 w-4',
                                value?.includes(category)
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )
                            "
                          />
                          {{ category }}
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            class="w-full"
            name="description"
          >
            <FormItem class="w-full">
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  type="text"
                  placeholder="Descripción"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </CardContent>
    </Card>

    <!-- Variants Section -->
    <Card>
      <CardHeader
        class="flex flex-col justify-between pb-0 md:flex-row md:pb-6"
      >
        <CardTitle class="text-xl font-semibold">Variantes</CardTitle>
        <Button
          type="button"
          variant="secondary"
          class="mt-4 flex w-full gap-2 md:mt-0 md:w-fit"
          @click.prevent="addVariant"
        >
          <PlusCircleIcon />
          Agregar variante
        </Button>
      </CardHeader>

      <CardContent>
        <ItemGroup>
          <template
            v-for="(variant, index) in values.variants"
            :key="`new-${index}`"
          >
            <Item class="flex flex-col p-0 py-4 md:flex-row">
              <ItemContent class="flex gap-4 md:flex-row">
                <FormField
                  v-slot="{ componentField }"
                  class="w-full"
                  :name="`variants[${index}].size`"
                >
                  <FormItem class="w-full">
                    <FormLabel>Tamaño</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Tamaño"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField
                  v-slot="{ componentField }"
                  class="w-full"
                  :name="`variants[${index}].color`"
                >
                  <FormItem class="w-full">
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Color"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField
                  v-slot="{ componentField }"
                  class="w-full"
                  :name="`variants[${index}].stock`"
                >
                  <FormItem class="w-full">
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="0"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <Button
                  type="button"
                  class="w-fit self-end"
                  variant="ghost"
                  @click.prevent="removeVariant(index)"
                >
                  <Trash2Icon
                    class="text-destructive dark:text-destructive-foreground"
                  />
                </Button>
              </ItemContent>
            </Item>
            <ItemSeparator v-if="index !== values.variants!.length - 1" />
          </template>
        </ItemGroup>
      </CardContent>
    </Card>

    <Button type="submit" class="mt-6 self-end" :disabled="isSubmitting">
      <span v-if="isSubmitting" class="flex items-center">
        <Spinner class="mr-2" />
        Agregando producto
      </span>
      <span v-else>Agregar producto</span>
    </Button>
  </form>
</template>
