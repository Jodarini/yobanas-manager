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
      <ProductFields v-model:brand-open="productWithVariantsForm.brandOpen.value"
        v-model:category-open="productWithVariantsForm.categoryOpen.value" v-model:brand-search-term="productWithVariantsForm.brandSearchTerm.value
          " v-model:category-search-term="productWithVariantsForm.categorySearchTerm.value
            " :form="productWithVariantsForm" mode="ADD" />
      <template v-if="props.variants.variants.length > 0">
        <VariantFields :form="productWithVariantsForm" mode="ADD" />
      </template>
    </div>
    <Button type="submit" class="ml-auto" :disabled="productWithVariantsForm.isSubmitting.value ||
      !productWithVariantsForm.meta.value.dirty
      ">
      <template v-if="productWithVariantsForm.isSubmitting.value">
        <Spinner class="mr-2" />
        Agregando producto...
      </template>
      <template v-else>Agregar producto</template>
    </Button>
  </form>
</template>
