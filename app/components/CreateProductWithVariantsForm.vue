<script setup lang="ts">
  import type { Product, UpdateVariant } from '~~/db/schema';

  const props = defineProps<{
    brands: string[];
    categories: string[];
    product: Product;
    variants: UpdateVariant;
  }>();

  const productWithVariantsForm = useProductWithVariants(
    'ADD',
    props.brands,
    props.categories,
    props.product,
    props.variants
  );
</script>

<template>
  <form @submit.prevent="productWithVariantsForm.onSubmit">
    <div class="mb-2 flex flex-col gap-2 md:flex-row">
      <ProductFields :form="productWithVariantsForm" mode="ADD" />
      <VariantFields :form="productWithVariantsForm" mode="ADD" />
    </div>
    <Button
      type="submit"
      class="ml-auto"
      :disabled="
        productWithVariantsForm.isSubmitting.value ||
        !productWithVariantsForm.meta.value.dirty
      "
    >
      Agregar producto
    </Button>
  </form>
</template>
