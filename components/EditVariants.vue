<script setup lang="ts">
  import { editProductSchema2 } from '~/db/schema';
  import { useToast } from '@/components/ui/toast/use-toast';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';

  const { toast } = useToast();
  const route = useRoute();

  const formSchema = toTypedSchema(editProductSchema2);
  const { data: productData } = useNuxtData('product');

  const { handleSubmit, values, setFieldValue } = useForm({
    validationSchema: formSchema,
    initialValues: {
      productInfo: {
        id: +route.params.id,
        title: productData.value?.productInfo?.title || '',
        description: productData.value?.productInfo?.description || '',
        price: productData.value?.productInfo?.price || 0,
      },
      variantInfo: productData.value?.variantInfo || [],
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

  const removeVariant = (index) => {
    const currentVariants = values.variantInfo || [];
    const newVariants = [...currentVariants];
    newVariants.splice(index, 1);
    setFieldValue('variantInfo', newVariants);
  };
</script>
<template>
  <form @submit="onSubmit">
    <!-- Product Info Fields -->
    <div class="space-y-4">
      <h3 class="text-xl font-semibold">Información del Producto</h3>

      <FormField v-slot="{ componentField }" name="productInfo.title">
        <FormItem>
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

      <FormField v-slot="{ componentField }" name="productInfo.description">
        <FormItem>
          <FormLabel>Descripción</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="Descripción"
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

    <!-- Variants Section -->
    <div class="mt-8 space-y-4">
      <div class="flex justify-between">
        <h3 class="text-xl font-semibold">Variantes</h3>
        <Button @click.prevent="addVariant">Agregar variante</Button>
      </div>

      <div
        v-for="(variant, index) in productData.variantInfo"
        :key="variant.id"
        class="space-y-4 rounded-lg bg-gray-800/8 p-4"
      >
        <div class="flex flex-col gap-4 md:flex-row">
          <FormField
            class="w-full"
            v-slot="{ componentField }"
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
            class="w-full"
            v-slot="{ componentField }"
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
            class="w-full"
            v-slot="{ componentField }"
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
