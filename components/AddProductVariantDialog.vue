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
      variantInfo: {
        ...values.variantInfo,
      },
    };

    try {
      const result = await $fetch(`/api/product/${route.params.id}`, {
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
  });
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
