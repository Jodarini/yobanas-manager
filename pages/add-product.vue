<script setup lang="ts">
  import { insertProductSchema, type InsertProduct } from '~/db/schema';
  import { useToast } from '@/components/ui/toast/use-toast';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';

  const store = useProductsStore();

  const { toast } = useToast();

  const { data } = await useFetch('/api/products', {
    key: 'products',
  });

  const categories = ref<string[]>([
    ...new Set(data.value?.flatMap((product) => product.category)),
  ]);
  const brands = ref<string[]>([
    ...new Set(data.value?.map((product) => product.brand)),
  ]);

  const formSchema = toTypedSchema(insertProductSchema);

  const { handleSubmit, values, setFieldValue, resetForm, isSubmitting } =
    useForm({
      validationSchema: formSchema,
      initialValues: {
        //   title: 'test',
        //   description: 'test',
        //   price: 1000,
        //   category: ['test'],
        //   brand: 'test',
        variants: [{ size: '', stock: 0, color: '' }],
      },
    });

  const onSubmit = handleSubmit(
    async (values) => {
      const product: InsertProduct = { ...values };
      try {
        store.addProduct(product);
        toast({ title: 'Producto agregado exitosamente' });
        resetForm();
      } catch (err) {
        toast({ variant: 'destructive', title: `${err}` });
        console.error(err);
      }
    },
    ({ errors, values }) => {
      console.error('❌ Validation failed!');
      console.error('Errors:', errors);
      console.error('Current values:', values);
    }
  );
</script>

<template>
  <ProductForm
    :on-submit
    :brands
    :categories
    :set-field-value
    :values
    :is-submitting
    :form-schema
  />
</template>
