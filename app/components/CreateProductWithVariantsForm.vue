<script setup lang="ts">
  const props = defineProps<{
    brands: string[];
    categories: string[];
    hasVariants: boolean;
  }>();

  const productWithVariantsForm = useProductWithVariants(
    'ADD',
    props.brands,
    props.categories
  );

  const emit = defineEmits(['createVariant']);
  function handleAddVariant() {
    emit('createVariant');
  }
</script>

<template>
  {{ productWithVariantsForm.values }}
  <form @submit.prevent="productWithVariantsForm.onSubmit">
    <div class="mb-2 flex flex-col gap-2 md:flex-row">
      <ProductFields
        v-model:brand-open="productWithVariantsForm.brandOpen.value"
        v-model:category-open="productWithVariantsForm.categoryOpen.value"
        v-model:brand-search-term="
          productWithVariantsForm.brandSearchTerm.value
        "
        v-model:category-search-term="
          productWithVariantsForm.categorySearchTerm.value
        "
        :form="productWithVariantsForm"
        mode="ADD"
      />
      <template v-if="hasVariants">
        <VariantFields :form="productWithVariantsForm" mode="ADD" />
      </template>
    </div>

    <template v-if="!hasVariants">
      <Button
        type="button"
        class="ml-auto"
        variant="outline"
        @click="handleAddVariant"
      >
        Crear variantes
      </Button>
    </template>
    <Button
      type="submit"
      class="ml-auto"
      :disabled="
        productWithVariantsForm.isSubmitting.value ||
        !productWithVariantsForm.meta.value.dirty
      "
    >
      <template v-if="productWithVariantsForm.isSubmitting.value">
        <Spinner class="mr-2" />
        Agregando producto...
      </template>
      <template v-else>Agregar producto</template>
    </Button>
  </form>
</template>
