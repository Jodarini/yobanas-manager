<script setup lang="ts">
  import { updateProductSchema, type ProductWithVariants } from '~/db/schema';
  import { useToast } from '@/components/ui/toast/use-toast';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';

  const props = defineProps<{
    product: ProductWithVariants;
  }>();

  const productData = props.product;
  const { toast } = useToast();
  const route = useRoute();
  const store = useProductsStore();

  const isDeleting = ref(false);

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

  const formSchema = toTypedSchema(updateProductSchema);

  const { handleSubmit, values, setFieldValue, isSubmitting } = useForm({
    validationSchema: formSchema,
    initialValues: {
      id: +route.params.id,
      title: productData.title,
      description: productData.description || '',
      price: productData.price,
      brand: productData.brand,
      category: productData.category,
      variants: productData.variants,
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
      console.error('❌ Validation failed!');
      console.error('Errors:', errors);
      console.error('Current values:', values);
    }
  );

  const deleteProduct = async () => {
    try {
      // TODO: add user confirmation
      isDeleting.value = true;
      await store.deleteProduct(+route.params.id);
      toast({ title: 'Elemento eliminado' });
      navigateTo('/');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Algo anduvo mal',
      });
    } finally {
      isDeleting.value = false;
    }
  };
</script>

<template>
  <ProductForm
    :on-submit
    :brands
    :categories
    :set-field-value
    :values
    :is-deleting
    :is-submitting
    @delete="deleteProduct"
  />
</template>
