<script setup lang="ts">
import type {
  insertProductSchema,
  updateProductSchema,
  UpdateVariant,
  ProductWithVariants,
} from '~~/db/schema';

const props = defineProps<{
  brands: string[];
  categories: string[];
  initialValues?: ProductWithVariants;
  isDeleting?: boolean;
  validationSchema: typeof insertProductSchema | typeof updateProductSchema;
  variant: 'ADD' | 'EDIT';
}>();

const variants = {
  variants: props.initialValues?.variants || [],
  productSKU: props.initialValues?.sku
} as UpdateVariant

</script>

<template>
  <UpdateProductForm :brands="props.brands" :categories="props.categories" :initialValues="props.initialValues"
    :variant="props.variant" />
  <UpdateVariantsForm :data='variants' :variant="props.variant" />
</template>
