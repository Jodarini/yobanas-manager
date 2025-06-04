<script setup lang="ts">
  import {
    editProductSchema,
    type SelectProductVariants,
    type SelectProductWithVariant,
  } from '~/db/schema';
  import { useToast } from '@/components/ui/toast/use-toast';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  const { toast } = useToast();

  const store = useProductsStore();
  const { product, variants } = defineProps<{
    product: ProductWithVariant;
    variants: ProductVariants[];
  }>();

  const selectedSize = ref('');
  const selectedColor = ref('');

  const selectedVariant = computed(() => {
    return variants?.find(
      (variant) =>
        variant.color === selectedColor.value &&
        variant.size === selectedSize.value
    );
  });
  const colors = computed(
    () => new Set(variants?.map((variant) => variant.color))
  );
  const sizes = computed(
    () => new Set(variants?.map((variant) => variant.size))
  );

  function selectColor(color: string) {
    selectedColor.value = color;
    setFieldValue('variantInfo.color', color);
  }

  function selectSize(size: string) {
    selectedSize.value = size;
    setFieldValue('variantInfo.size', size);
  }
  const formSchema = toTypedSchema(editProductSchema);

  watch(
    selectedVariant,
    (newVariant) => {
      if (newVariant) {
        setFieldValue('variantInfo.stock', newVariant.stock);
      }
    },
    { immediate: true }
  );

  const { handleSubmit, resetForm, setFieldValue } = useForm({
    validationSchema: formSchema,
    initialValues: {
      productInfo: {
        title: product.productInfo.title,
        description: product.productInfo.description,
        category: ['test'],
        brand: product.productInfo.brand,
        price: product.productInfo.price,
        thumbnail: product.productInfo.thumbnail,
      },
    },
  });

  const addProduct = handleSubmit(async (values) => {
    const newProduct = ref(values);
    newProduct.value = {
      productInfo: {
        ...values.productInfo,
      },
      variantInfo: {
        ...values.variantInfo,
      },
    };

    try {
      const result = await $fetch('/api/product/edit-variant', {
        method: 'put',
        body: newProduct.value,
      });
      toast({
        title: `${result.message}`,
        description: `Nuevo stock: ${values.variantInfo.stock}`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: `${err}`,
      });
      console.error(err);
    }
    store.addProduct(newProduct.value);
  });
</script>

<template>
  <Dialog>
    <DialogTrigger>
      <Button variant="outline">Editar producto</Button>
    </DialogTrigger>
    <DialogContent>
      <form @submit.prevent="addProduct">
        <DialogHeader>
          <DialogTitle class="mb-6">Editar producto</DialogTitle>
          <DialogDescription class="space-y-4">
            <FormField v-slot="{ componentField }" name="productInfo.title">
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    required
                    type="text"
                    placeholder="Nombre"
                    :default-value="product.productInfo.title"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ componentField }"
              name="productInfo.description"
            >
              <FormItem>
                <FormLabel>Descripcion</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Descripcion"
                    :default-value="product.productInfo.description"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="productInfo.price">
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input
                    required
                    type="number"
                    placeholder="Precio"
                    :default-value="product.productInfo.price"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="variantInfo.color">
              <FormItem>
                <FormLabel class="font-bold">Color</FormLabel>
                <FormControl>
                  <ToggleGroup type="single">
                    <div class="flex flex-wrap gap-2">
                      <template v-for="color in colors" :key="color">
                        <ToggleGroupItem
                          variant="outline"
                          :value="color"
                          @click="selectColor(color)"
                        >
                          {{ color }}
                        </ToggleGroupItem>
                      </template>
                      <Button type="button" variant="outline">+</Button>
                    </div>
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="variantInfo.size">
              <FormItem>
                <FormLabel class="font-bold">Talla</FormLabel>
                <FormControl>
                  <ToggleGroup type="single">
                    <div class="flex flex-wrap gap-2">
                      <template v-for="size in sizes" :key="size">
                        <ToggleGroupItem
                          variant="outline"
                          :value="size"
                          @click="selectSize(size)"
                        >
                          {{ size }}
                        </ToggleGroupItem>
                      </template>
                      <Button type="button" variant="outline">+</Button>
                    </div>
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <div class="grid grid-cols-[auto_1fr] gap-6">
              <FormField
                v-if="selectedSize && selectedColor && selectedVariant"
                v-slot="{ value }"
                name="variantInfo.stock"
              >
                <FormItem>
                  <FormLabel class="font-bold">Stock</FormLabel>
                  <NumberField
                    class="gap-2"
                    :min="0"
                    :model-value="value"
                    @update:model-value="
                      (v) => {
                        if (v) {
                          setFieldValue('variantInfo.stock', v);
                        } else {
                          setFieldValue('variantInfo.stock', undefined);
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
                  <FormDescription>
                    Ingresa la cantidad de productos que tienes en stock.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit">Actualizar producto</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
