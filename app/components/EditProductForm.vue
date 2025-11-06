<script setup lang="ts">
import {
  updateProductSchema,
  type ProductWithVariants,
  type UpdateProduct,
} from '~~/db/schema';
import { useToast } from '@/components/ui/toast/use-toast';

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

const onSubmit = async (values: UpdateProduct) => {
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
};

const deleteProduct = async () => {
  try {
    // TODO: add user confirmation
    isDeleting.value = true;
    await store.deleteProduct(+route.params.id!);
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
  <ProductForm mode="EDIT" :brands :categories :initial-values="productData" :is-deleting
    :validation-schema="updateProductSchema" @delete="deleteProduct" @submit="onSubmit" />
</template>
