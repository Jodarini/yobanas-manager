<script setup lang="ts">
  import { addVariantSchema, type ProductVariants } from '~/db/schema';
  import { useToast } from '@/components/ui/toast/use-toast';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';

  const route = useRoute();
  const { toast } = useToast();

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

  const addProduct = handleSubmit(async (values) => {
    const newProduct = ref(values);
    newProduct.value = {
      id: +route.params.id,
      variantInfo: {
        ...values.variantInfo,
      },
    };

    if (addingSize.value) {
      try {
        const result = await $fetch(
          `/api/product/${+route.params.id}/addVariant`,
          {
            method: 'POST',
            body: newProduct.value,
          }
        );
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
    } else {
      try {
        const result = await $fetch(`/api/product/${+route.params.id}`, {
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
    console.log('deleteVariant');
    const variantToDelete = {
      id: +route.params.id,
      size: selectedSize.value,
      color: selectedColor.value,
    };
    console.log(variantToDelete);
    try {
      const result = await $fetch(
        `/api/product/${+route.params.id}/deleteVariant`,
        {
          method: 'delete',
          body: variantToDelete,
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
  <Dialog>
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
