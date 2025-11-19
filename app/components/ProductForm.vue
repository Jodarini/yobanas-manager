<script setup lang="ts">
  import type {
    UpdateVariant,
    ProductWithVariants,
    Product,
  } from '~~/db/schema';

  const props = defineProps<{
    brands: string[];
    categories: string[];
    initialValues?: ProductWithVariants;
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
    stock: props.initialValues?.stock || 0,
  } as Product;

  const variants = {
    variants: props.initialValues?.variants || [],
    productSKU: props.initialValues?.sku,
  } as UpdateVariant;

  const hasVariants = ref(false);

  if (props.initialValues?.variants) {
    hasVariants.value = props.initialValues?.variants.length > 0;
  }

  function handleCreateVariant() {
    hasVariants.value = true;
  }
</script>

<template>
  <div v-if="props.mode === 'EDIT'">
    <div class="mb-2 flex flex-col gap-2 md:flex-row">
      <UpdateProductForm
        :brands="props.brands"
        :categories="props.categories"
        :initial-values="product"
        :has-variants="hasVariants"
        @create-variant="handleCreateVariant"
      />
      <UpdateVariantsForm :data="variants" :is-deleted="!!product.deleted_at" />
    </div>
  </div>

  <div v-if="props.mode === 'ADD'">
    <CreateProductWithVariantsForm
      :brands="props.brands"
      :categories="props.categories"
      :has-variants="hasVariants"
      @create-variant="handleCreateVariant"
    />
  </div>
</template>
