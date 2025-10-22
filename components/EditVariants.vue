<script setup lang="ts">
  import { editProductSchema2, type ProductWithVariant } from '~/db/schema';
  import { useToast } from '@/components/ui/toast/use-toast';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import {
    Check,
    ChevronsUpDown,
    PlusCircleIcon,
    Trash2Icon,
    Plus,
  } from 'lucide-vue-next';
  import { Button } from '@/components/ui/button';
  import { cn } from '@/lib/utils';
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

  import { Badge } from '@/components/ui/badge';

  const props = defineProps<{
    product: ProductWithVariant;
  }>();

  const productData = props.product;
  const { toast } = useToast();
  const route = useRoute();
  const store = useProductsStore();

  const { data } = await useFetch('/api/products', {
    key: 'products',
  });

  const categories = computed(() => {
    const cats = data.value?.flatMap((product) => product.category);
    return [...new Set(cats)].sort();
  });

  const brands = computed(() => {
    if (!data.value) return [];
    return [...new Set(data.value.map((product) => product.brand))].sort();
  });

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
        brand: productData.productInfo?.brand || '',
        category: productData.productInfo?.category || [],
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
    currentVariants.value = [...values.variantInfo];
    const newVariant = {
      id: Math.floor(Math.random() * 1000000),
      size: '',
      color: '',
      stock: 0,
    };
    currentVariants.value.unshift(newVariant);
    setFieldValue('variantInfo', currentVariants.value);
  };

  const removeVariant = (index: number) => {
    currentVariants.value = [...values.variantInfo];
    currentVariants.value.splice(index, 1);
    setFieldValue('variantInfo', currentVariants.value);
  };

  const deleteProduct = async (index: number) => {
    try {
      // TODO: add user confirmation
      store.deleteProduct(index);
      toast({ title: 'Elemento eliminado' });
      navigateTo('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Algo anduvo mal',
      });
    }
  };

  const brandOpen = ref(false);
  const brandSearchTerm = ref('');

  const filteredBrands = computed(() => {
    if (!brandSearchTerm.value) return brands.value;
    return brands.value.filter((b) =>
      b.toLowerCase().includes(brandSearchTerm.value.toLowerCase())
    );
  });

  const categoryOpen = ref(false);
  const categorySearchTerm = ref('');

  const filteredCategories = computed(() => {
    if (!categorySearchTerm.value) return categories.value;
    return categories.value.filter((c) =>
      c.toLowerCase().includes(categorySearchTerm.value.toLowerCase())
    );
  });

  function handleCategoryToggle(category: string) {
    const currentValue = values.productInfo?.category || [];
    const isSelected = currentValue.includes(category);

    const next = isSelected
      ? currentValue.filter((v) => v !== category)
      : [...currentValue, category];

    setFieldValue('productInfo.category', next);
  }

  function handleCategoryRemove(category: string) {
    const currentValue = values.productInfo?.category || [];
    setFieldValue(
      'productInfo.category',
      currentValue.filter((v) => v !== category)
    );
  }

  const brandSearchTerm2 = ref('');
  const createBrand = () => {
    setFieldValue('productInfo.brand', brandSearchTerm2.value);
    brandOpen.value = false;
  };

  const createCategory = () => {
    const currentValue = values.productInfo?.category || [];
    setFieldValue('productInfo.category', [
      ...currentValue,
      categorySearchTerm.value,
    ]);
    categorySearchTerm.value = '';
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
        <div class="mb-4 flex flex-col gap-4 md:flex-row">
          <FormField
            v-slot="{ componentField }"
            class="flex-1"
            name="productInfo.title"
          >
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

          <FormField v-slot="{ value }" class="flex-1" name="productInfo.price">
            <FormItem class="w-full">
              <FormLabel>Precio</FormLabel>
              <NumberField
                class="gap-2"
                :min="0"
                :format-options="{
                  style: 'currency',
                  currency: 'COP',
                  currencyDisplay: 'symbol',
                  currencySign: 'accounting',
                  trailingZeroDisplay: 'stripIfInteger',
                  useGrouping: true,
                  signDisplay: 'auto',
                }"
                :model-value="value"
                @update:model-value="
                  (v) => {
                    if (v) {
                      setFieldValue('productInfo.price', v);
                    } else {
                      setFieldValue('productInfo.price', undefined);
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
          <FormField v-slot="{ componentField }" name="productInfo.brand">
            <FormItem class="flex flex-col">
              <FormLabel>Marca</FormLabel>
              <FormControl>
                <Popover v-model:open="brandOpen">
                  <PopoverTrigger as-child>
                    <Button
                      type="button"
                      variant="outline"
                      class="w-full justify-between"
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
                          type="button"
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

          <FormField v-slot="{ value }" name="productInfo.category">
            <FormItem class="flex flex-col">
              <FormLabel>Categorías</FormLabel>
              <Popover v-model:open="categoryOpen">
                <PopoverTrigger as-child>
                  <FormControl>
                    <Button
                      type="button"
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
                            :key="`${item}-badges`"
                            variant="secondary"
                            class="gap-1"
                          >
                            <span>
                              {{ item }}
                            </span>
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
                        type="button"
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
                          :key="category!"
                          :value="category!"
                          @select="handleCategoryToggle(category!)"
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
            name="productInfo.description"
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
          variant="outline"
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
            v-for="(variant, index) in currentVariants"
            :key="variant.id"
          >
            <Item class="flex flex-col p-0 py-4 md:flex-row">
              <ItemContent class="flex gap-4 md:flex-row">
                <FormField
                  v-slot="{ componentField }"
                  class="w-full"
                  :name="`variantInfo[${index}].size`"
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
                  :name="`variantInfo[${index}].color`"
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
                  :name="`variantInfo[${index}].stock`"
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
              </ItemContent>
              <ItemActions>
                <Button
                  type="button"
                  class="w-fit md:self-end"
                  variant="ghost"
                  @click.prevent="removeVariant(index)"
                >
                  <Trash2Icon
                    class="text-destructive dark:text-destructive-foreground"
                  />
                </Button>
              </ItemActions>
            </Item>
            <ItemSeparator v-if="index !== currentVariants.length - 1" />
          </template>
        </ItemGroup>
      </CardContent>
    </Card>

    <div class="flex max-h-fit justify-end gap-4">
      <Button
        type="button"
        variant="destructive"
        class=""
        @click.prevent="deleteProduct(+route.params.id)"
      >
        Eliminar producto
      </Button>
      <Button type="submit" class="">Actualizar producto</Button>
    </div>
  </form>
</template>
