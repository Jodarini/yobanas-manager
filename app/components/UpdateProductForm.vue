<script setup lang="ts">
  import type { Product } from '~~/db/schema';
  import { useToast } from './ui/toast';

  const props = defineProps<{
    brands: string[];
    categories: string[];
    initialValues?: Product;
    isDeleting?: boolean;
  }>();

  const form = useProductFormState(
    props.brands,
    props.categories,
    props.initialValues
  );

  const { toast } = useToast();

  const onSubmit = form.handleSubmit(
    async (values) => {
      await $fetch(`/api/product/:id/addProduct`, {
        method: 'put',
        body: values,
      });

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
      mode="EDIT"
    />
  </form>
</template>
