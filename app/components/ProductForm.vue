<script setup lang="ts">
import type {
  insertProductSchema,
  updateProductSchema,
  UpdateVariant,
  ProductWithVariants,
  Product,
} from '~~/db/schema';

const props = defineProps<{
  brands: string[];
  categories: string[];
  initialValues?: ProductWithVariants;
  isDeleting?: boolean;
  validationSchema: typeof insertProductSchema | typeof updateProductSchema;
  mode: 'ADD' | 'EDIT';
}>();

const product = {
  id: props.initialValues?.id || 0,
  sku: props.initialValues?.sku || '',
  user_id: props.initialValues?.user_id || null,
  title: props.initialValues?.title || '',
  description: props.initialValues?.description || '',
  brand: props.initialValues?.brand || '',
  price: props.initialValues?.price || 0,
  thumbnail: props.initialValues?.thumbnail || '',
  category: props.initialValues?.category || [],
  deleted_at: props.initialValues?.deleted_at || null,
} as Product

const variants = {
  variants: props.initialValues?.variants || [],
  productSKU: props.initialValues?.sku
} as UpdateVariant


</script>

<template>
  <div v-if="props.mode === 'EDIT'">
    <UpdateProductForm :brands="props.brands" :categories="props.categories" :initialValues="product" />
    <UpdateVariantsForm :data='variants' />
  </div>

  <div v-if="props.mode === 'ADD'">
    <CreateProductWithVariantsForm :brands="props.brands" :categories="props.categories" :product="product" :variants />
  </div>

</template>
