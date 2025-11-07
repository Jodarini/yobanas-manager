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
    <div class="flex flex-col md:flex-row gap-2 mb-2">
      <ProductFields :form='productWithVariantsForm' mode='ADD' />
      <VariantFields :form='productWithVariantsForm' mode='ADD' />
    </div>
    <Button type="submit" class="ml-auto"
      :disabled="productWithVariantsForm.isSubmitting.value || !productWithVariantsForm.meta.value.dirty">
      Agregar producto
    </Button>
  </form>
</template>
