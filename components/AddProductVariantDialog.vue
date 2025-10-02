<script setup lang="ts">
  import { addVariantSchema, type ProductVariants } from '~/db/schema';
  import { useToast } from '@/components/ui/toast/use-toast';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';

  const route = useRoute();
  const { toast } = useToast();
  const emit = defineEmits(['updatedVariants']);

  const myArray = [1, 2, 3];
  let previousProduct = undefined;
  const { data: productData } = useNuxtData('product');
  const { variants } = defineProps<{
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
  const colors = computed(() => {
    const variants = productData.value?.variants || [];
    return new Set(variants.map((v) => v.color));
  });

  const sizes = computed(() => {
    const variants = productData.value?.variants || [];
    return new Set(variants.map((v) => v.size));
  });

  function selectColor(color: string) {
    selectedColor.value = color;
    setFieldValue('variantInfo.color', color);
  }

  function selectSize(size: string) {
    selectedSize.value = size;
    setFieldValue('variantInfo.size', size);
  }

  watch(
    selectedVariant,
    (newVariant) => {
      if (newVariant) {
        setFieldValue('variantInfo.stock', newVariant.stock);
      }
    },
    { immediate: true }
  );

  const formSchema = toTypedSchema(addVariantSchema);
  const { handleSubmit, setFieldValue } = useForm({
    validationSchema: formSchema,
  });

  // async function addTodo() {
  //
  //   await $fetch('/api/product/${+route.params.id}/addVariant', {
  //     method: 'post',
  //     body: {
  //       todo: newTodo.value,
  //     },
  //     onRequest() {
  //       // Store the previously cached value to restore if fetch fails.
  //       previousTodos = todos.value;
  //
  //       // Optimistically update the todos.
  //       todos.value = [...todos.value, newTodo.value];
  //     },
  //     onResponseError() {
  //       // Rollback the data if the request failed.
  //       todos.value = previousTodos;
  //     },
  //     async onResponse() {
  //       // Invalidate todos in the background if the request succeeded.
  //       await refreshNuxtData('todos');
  //     },
  //   });
  // }

  const addProduct = handleSubmit(async (values) => {
    const newProduct = ref(values);
    newProduct.value = {
      id: +route.params.id,
      variantInfo: {
        ...values.variantInfo,
      },
    };

    try {
      if (addingSize.value) {
        // Add new variant (color and size)
        const result = await $fetch(
          `/api/product/${+route.params.id}/addVariant`,
          {
            method: 'POST',
            body: newProduct.value,
            onRequest() {
              previousProduct = productData.value;
              productData.value = {
                ...productData.value,
                variants: [
                  ...productData.value.variants,
                  {
                    color: newProduct.value.variantInfo.color,
                    size: newProduct.value.variantInfo.size,
                    stock: newProduct.value.variantInfo.stock,
                  },
                ],
              };
            },
            onResponseError() {
              productData.value = previousProduct;
            },
            // async onResponse() {
            //   // Maybe should emit a signal after closing dialog to refresh instead of using this
            //   // Refresh the data in background to get actual server state
            //   // await refreshNuxtData('product');
            // },
          }
        );
        toast({
          title: `${result.message}`,
          description: `Nuevo stock: ${values.variantInfo.stock}`,
        });
      } else {
        const result = await $fetch(`/api/product/${+route.params.id}`, {
          method: 'put',
          body: newProduct.value,
          onRequest() {
            previousProduct = productData.value;
            const updatedVariants2 = productData.value.variants.map(
              (variant) => {
                if (
                  newProduct.value.variantInfo.color === variant.color &&
                  newProduct.value.variantInfo.size === variant.size
                ) {
                  return {
                    ...variant,
                    stock: newProduct.value.variantInfo.stock,
                  };
                } else {
                  return variant;
                }
              }
            );
            productData.value = {
              ...productData.value,
              variants: updatedVariants2,
            };
          },
          onResponseError() {
            productData.value = previousProduct;
          },
        });
        toast({
          title: `${result.message}`,
          description: `Nuevo stock: ${values.variantInfo.stock}`,
        });
      }
      emit('updatedVariants');
      // emit('variantsUpdated');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: `${err}`,
      });
      console.error(err);
    }
  });

  const addingSize = ref(false);
  const addingColor = ref(false);

  function showAddSize() {
    addingSize.value = true;
  }

  function showAddColor() {
    addingColor.value = true;
  }

  async function deleteVariant() {
    const variantToDelete = {
      id: +route.params.id,
      size: selectedSize.value,
      color: selectedColor.value,
    };
    try {
      const result = await $fetch(
        `/api/product/${+route.params.id}/deleteVariant`,
        {
          method: 'delete',
          body: variantToDelete,
          onRequest() {
            previousProduct = productData.value;
            // const newVariants = productData.value.variants.map((variant) => {
            //   if (
            //     variantToDelete.size !== variant.size ||
            //     variantToDelete.color !== variant.color
            //   ) {
            //     return variant;
            //   }
            // });

            const newVariants = productData.value.variants.filter(
              (variant) =>
                variant.size !== variantToDelete.size ||
                variant.color !== variantToDelete.color
            );
            console.log(newVariants);
            console.log(productData.value);
            productData.value = { ...productData.value, variants: newVariants };
            console.log(productData.value);
          },
        }
      );
      toast({
        // title: `${result}`,
        title: `Borrando...`,
        // description: `Nuevo stock: ${values.variantInfo.stock}`,
        description: `Product: ${selectedColor.value}`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: `${err}`,
      });
      console.error(err);
    }
  }
</script>

<template>
  <Dialog :modal="false">
    <DialogTrigger>
      <Button variant="outline">Editar variantes</Button>
    </DialogTrigger>
    <DialogContent>
      <form @submit.prevent="addProduct">
        <DialogHeader>
          <DialogTitle class="mb-6">Editar variante</DialogTitle>
          <DialogDescription class="space-y-4">
            <FormField v-slot="{ value }" name="variantInfo.color">
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

                      <div v-if="addingColor">
                        <Input
                          type="text"
                          placeholder="Color"
                          :model-value="value"
                          @keydown.enter.prevent="selectColor(value)"
                          @update:model-value="
                            (v) => {
                              if (v) {
                                setFieldValue('variantInfo.color', v);
                              } else {
                                setFieldValue('variantInfo.color', undefined);
                              }
                            }
                          "
                        />
                      </div>
                      <Button
                        v-else
                        type="button"
                        variant="outline"
                        @click="showAddColor"
                      >
                        +
                      </Button>
                    </div>
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ value }" name="variantInfo.size">
              <FormItem>
                <FormLabel class="font-bold">Talla</FormLabel>
                <FormControl>
                  <ToggleGroup type="single">
                    <div class="flex flex-wrap gap-2">
                      <template v-for="size in sizes" :key="size">
                        <ToggleGroupItem
                          variant="outline"
                          :value="size!"
                          @click="selectSize(size!)"
                        >
                          {{ size }}
                        </ToggleGroupItem>
                      </template>
                      <div v-if="addingSize">
                        <Input
                          type="text"
                          placeholder="Tamaño"
                          :model-value="value"
                          @keydown.enter.prevent="selectSize(value)"
                          @update:model-value="
                            (v) => {
                              if (v) {
                                setFieldValue('variantInfo.size', v);
                              } else {
                                setFieldValue('variantInfo.size', undefined);
                              }
                            }
                          "
                        />
                      </div>
                      <Button
                        v-else
                        type="button"
                        variant="outline"
                        @click="showAddSize"
                      >
                        +
                      </Button>
                    </div>
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <div class="grid grid-cols-[auto_1fr] gap-6">
              <FormField
                v-if="selectedSize && selectedColor"
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
                <Button type="button" variant="outline" @click="deleteVariant">
                  Borrar
                </Button>
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
