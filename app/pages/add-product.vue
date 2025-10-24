<script setup lang="ts">
import { insertProductSchema, type InsertProduct } from '~~/db/schema';
import { useToast } from '@/components/ui/toast/use-toast';
import { toTypedSchema } from '@vee-validate/zod';

const store = useProductsStore();

const { toast } = useToast();

const { data } = await useFetch('/api/products', {
  key: 'products',
});

const categories = ref<string[]>([
  ...new Set(data.value?.flatMap((product) => product.category)),
]);
const brands = ref<string[]>([
  ...new Set(data.value?.map((product) => product.brand)),
]);

const formSchema = toTypedSchema(insertProductSchema);

const handleSubmit = async (values) => {
  const product: InsertProduct = { ...values };
  try {
    store.addProduct(product);
    toast({ title: 'Producto agregado exitosamente' });
  } catch (err) {
    toast({ variant: 'destructive', title: `${err}` });
    console.error(err);
  }
};
</script>

<template>
  <ProductForm variant="ADD" :brands :categories :form-schema :validation-schema="insertProductSchema"
    @submit="handleSubmit" />
</template>
