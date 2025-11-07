<script setup lang="ts">
  import type { UpdateVariant } from '~~/db/schema';
  import { useToast } from './ui/toast';

  const props = defineProps<{
    data?: UpdateVariant;
    isDeleting?: boolean;
  }>();

  const { toast } = useToast();

  const form = useVariantsFormState(props.data);
  const route = useRoute();
  const onSubmit = form.handleSubmit(
    async (values) => {
      const variantExists = form.checkIfVariantExists();
      if (variantExists !== -1) {
        form.setErrors({
          [`variants.${variantExists}`]: 'La variante ya existe',
        });
        return;
      }
      await $fetch(`/api/product/${route.params.id}/updateVariant`, {
        method: 'put',
        body: {
          variants: values.variants,
          productSKU: props.data?.productSKU,
        },
      });
      toast({
        title: 'Variante actualizada exitosamente',
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
  <form class="min-h-full flex-2" @submit.prevent="onSubmit">
    <VariantFields :form mode="EDIT" />
  </form>
</template>
