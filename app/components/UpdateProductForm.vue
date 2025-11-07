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
  <form @submit.prevent="onSubmit">
    <ProductFields :form mode="EDIT" />
  </form>
</template>
