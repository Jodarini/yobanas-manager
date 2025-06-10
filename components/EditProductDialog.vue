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

  const formSchema = toTypedSchema(editProductSchema);

  const { handleSubmit } = useForm({
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

  const editProduct = handleSubmit(async (values) => {
    const newProduct = ref(values);
    newProduct.value = {
      productInfo: {
        ...values.productInfo,
      },
    };

    try {
      const result = await $fetch(`/api/product/${route.params.id}`, {
        method: 'put',
        body: newProduct.value,
      });
      toast({
        title: `${result.message}`,
        description: `Se actualizó el producto: ${values.productInfo.title}`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: `${err}`,
      });
      console.error(err);
    }
    // store.addProduct(newProduct.value);
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
                    :default-value="product.productInfo.description!"
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
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit">Actualizar producto</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
