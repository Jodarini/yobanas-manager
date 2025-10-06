<script setup lang="ts">
  import { editProductSchema, type ProductWithVariant } from '~/db/schema';
  import { useToast } from '@/components/ui/toast/use-toast';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  const { toast } = useToast();
  const route = useRoute();

  const { product } = defineProps<{
    product: ProductWithVariant;
  }>();

  const { data: productData } = useNuxtData('product');
  let previousProduct = undefined;

  const formSchema = toTypedSchema(editProductSchema);

  const { handleSubmit } = useForm({
    validationSchema: formSchema,
    initialValues: {
      productInfo: {
        title: productData.value.productInfo.title,
        description: productData.value.productInfo.description,
        category: ['test'],
        brand: productData.value.productInfo.brand,
        price: productData.value.productInfo.price,
        thumbnail: productData.value.productInfo.thumbnail,
      },
    },
  });

  const editProduct = handleSubmit(async (values) => {
    const newProduct = ref(values);

    try {
      const result = await $fetch(`/api/product/${route.params.id}`, {
        method: 'put',
        body: newProduct.value,
        onRequest() {
          previousProduct = productData.value;
          productData.value = {
            ...productData.value,
            productInfo: newProduct.value.productInfo,
          };
          toast({
            title: `Producto actualizado correctamente`,
          });
        },
        onResponseError() {
          productData.value = previousProduct;
          toast({
            title: 'Algo anduvo mal! Intentalo de nuevo',
          });
        },
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
      <Button variant="outline">Editar producto</Button>
    </DialogTrigger>
    <DialogContent>
      <form @submit.prevent="editProduct">
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
                    :default-value="productData.productInfo.title"
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
                    :default-value="productData.productInfo.description!"
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
                    :default-value="productData.productInfo.price"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit">Actualizar producto</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
