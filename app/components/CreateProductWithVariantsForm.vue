<script setup lang="ts">
import type { Product, UpdateVariant } from '~~/db/schema';

const props = defineProps<{
  brands: string[];
  categories: string[];
  product: Product;
  variants: UpdateVariant;
}>();

const productWithVariantsForm = useProductWithVariants('ADD', props.brands,
  props.categories, props.product, props.variants);

</script>

<template>
  <form @submit.prevent="productWithVariantsForm.onSubmit">
    <ProductFields :form='productWithVariantsForm' mode='ADD' />
    <VariantFields :form='productWithVariantsForm' mode='ADD' />
    <Button type="submit" :disabled="!productWithVariantsForm.meta.value.dirty">
      Agregar producto
    </Button>
  </form>
</template>
