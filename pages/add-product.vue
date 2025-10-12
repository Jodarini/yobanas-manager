<script setup lang="ts">
  import { editProductSchema2 } from '~/db/schema';
  import { useToast } from '@/components/ui/toast/use-toast';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import { Check, ChevronsUpDown } from 'lucide-vue-next';
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

  const formSchema = toTypedSchema(editProductSchema2);

  const { handleSubmit, values, setFieldValue } = useForm({
    validationSchema: formSchema,
  });

  const brands = store.productBrands;

  const newProduct = ref(values);

  const onSubmit = handleSubmit(
    async () => {
      try {
        await $fetch(`/api/product/add`, {
          method: 'POST',
          body: newProduct.value,
        });

        toast({
          title: 'Producto agregado exitosamente',
        });
        //TODO: clear inputs
      } catch (err) {
        toast({
          variant: 'destructive',
          title: `${err}`,
        });
        console.error(err);
      }
    },
    ({ errors, values }) => {
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
      <h3 class="text-xl font-semibold">Agregar producto</h3>

      <div class="flex flex-col gap-4 md:flex-row">
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

        <FormField class="flex-1" name="productInfo.brand">
          <FormItem class="flex w-full flex-col">
            <FormLabel>Marca</FormLabel>

            <Combobox>
              <FormControl class="w-full">
                <ComboboxAnchor>
                  <div class="relative w-full max-w-sm items-center">
                    <ComboboxInput
                      :display-value="(val) => val?.name ?? ''"
                      placeholder="Seleccione una marca..."
                    />
                    <ComboboxTrigger
                      class="absolute inset-y-0 end-0 flex items-center justify-center px-3"
                    >
                      <ChevronsUpDown class="text-muted-foreground size-4" />
                    </ComboboxTrigger>
                  </div>
                </ComboboxAnchor>
              </FormControl>

              <ComboboxList>
                <ComboboxEmpty>Nothing found.</ComboboxEmpty>

                <ComboboxGroup>
                  <ComboboxItem
                    v-for="opt in brands"
                    :key="opt"
                    :value="opt"
                    @select="
                      () => {
                        setFieldValue('productInfo.brand', opt);
                      }
                    "
                  >
                    {{ opt }}
                    <ComboboxItemIndicator>
                      <Check class="ml-auto h-4 w-4" />
                    </ComboboxItemIndicator>
                  </ComboboxItem>
                </ComboboxGroup>
              </ComboboxList>
            </Combobox>

            <!-- <FormDescription>
            </FormDescription> -->
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          class="flex-1"
          name="productInfo.price"
        >
          <FormItem class="w-full">
            <FormLabel>Precio</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="1000"
                placeholder="Precio"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

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

    <!-- Variants Section -->
    <div class="mt-8 space-y-4">
      <div class="flex justify-between">
        <h3 class="text-xl font-semibold">Variantes</h3>
        <Button @click.prevent="addVariant">Agregar variante</Button>
      </div>

      <div
        v-for="(variant, index) in newProduct.variantInfo"
        :key="variant.id"
        class="space-y-4 rounded-lg bg-gray-800/8 p-4"
      >
        <div class="flex flex-col gap-4 md:flex-row">
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
          <Button
            class="w-fit self-end"
            variant="destructive"
            @click.prevent="removeVariant(index)"
          >
            X
          </Button>
        </div>
      </div>
    </div>

    <Button type="submit" class="mt-6 self-end">Actualizar producto</Button>
  </form>
</template>
