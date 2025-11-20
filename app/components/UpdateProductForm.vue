<script setup lang="ts">
  import type { Product } from '~~/db/schema';
  import { useToast } from './ui/toast';

  const props = defineProps<{
    brands: string[];
    categories: string[];
    initialValues?: Product;
  }>();

  const form = useProductFormState(
    props.brands,
    props.categories,
    props.initialValues
  );

  const { toast } = useToast();

  const onSubmit = form.handleSubmit(
    async (values) => {
      await $fetch(`/api/product/:id`, {
        method: 'put',
        body: values,
      });

      await refreshNuxtData('products');

      toast({
        title: 'Producto actualizado exitosamente',
      });

      form.resetForm({ values }, { force: true });
    },

    ({ errors }) => {
      toast({
        variant: 'destructive',
        title: 'Error en el formulario',
        description: 'Verifique los campos marcados en rojo',
      });
      console.error(errors);
    }
  );
</script>

<template>
  <form class="min-h-full flex-1" @submit.prevent="onSubmit">
    <ProductFields
      v-model:brand-open="form.brandOpen.value"
      v-model:category-open="form.categoryOpen.value"
      v-model:brand-search-term="form.brandSearchTerm.value"
      v-model:category-search-term="form.categorySearchTerm.value"
      :form
      :is-deleted="!!initialValues?.deleted_at"
      mode="EDIT"
    />
  </form>
</template>
