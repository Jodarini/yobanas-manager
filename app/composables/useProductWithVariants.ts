import type { NuxtError } from '#app';
import { Button, NuxtLink } from '#components';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { toast, ToastAction } from '~/components/ui/toast';
import { normalizeString } from '~/lib/utils';
import {
  insertProductSchema,
  type Product,
  type UpdateVariant,
} from '~~/db/schema';

export function useProductWithVariants(
  mode: 'ADD' | 'EDIT',
  brands: string[],
  categories: string[],
  product: Product,
  variants: UpdateVariant
) {
  const formSchema = toTypedSchema(insertProductSchema);

  const {
    handleSubmit,
    values,
    setFieldValue,
    resetForm,
    isSubmitting,
    validate,
    meta,
    setErrors,
    errors,
  } = useForm({
    validationSchema: formSchema,
    initialValues: {
      title: 'test',
      description: 'test',
      price: 1000,
      category: ['test'],
      brand: 'test',
      variants: [
        {
          color: 'test',
          size: 'test',
          stock: 1,
        },
      ],
    },
  });

  const brandOpen = ref(false);
  const brandSearchTerm = ref('');
  const categoryOpen = ref(false);
  const categorySearchTerm = ref('');

  const filteredBrands = computed(() => {
    if (!brandSearchTerm.value) return brands;
    return brands.filter((b) =>
      b.toLowerCase().includes(brandSearchTerm.value.toLowerCase())
    );
  });

  const filteredCategories = computed(() => {
    if (!categorySearchTerm.value) return categories;
    return categories.filter((c) =>
      c.toLowerCase().includes(categorySearchTerm.value.toLowerCase())
    );
  });

  const createBrand = () => {
    setFieldValue('brand', brandSearchTerm.value);
    brandOpen.value = false;
  };

  const createCategory = () => {
    const currentValue = values.category || [];
    setFieldValue('category', [...currentValue, categorySearchTerm.value]);
    categorySearchTerm.value = '';
  };

  function handleCategoryToggle(category: string) {
    const current = values.category || [];
    const next = current.includes(category)
      ? current.filter((v) => v !== category)
      : [...current, category];

    setFieldValue('category', next);
  }

  const checkIfVariantExists = () => {
    const currentVariants = values.variants || [];
    const seen = new Map();

    for (let i = 0; i < currentVariants.length; i++) {
      const variant = currentVariants[i];
      const key = `${normalizeString(variant!.size)}-${normalizeString(variant!.color)}`;

      if (seen.has(key)) {
        return i;
      }
      seen.set(key, i);
    }

    return -1;
  };

  const addVariant = () => {
    const currentVariants = values.variants || [];
    const newVariant = {
      size: '',
      color: '',
      stock: 0,
    };

    setFieldValue('variants', [...currentVariants, newVariant]);
  };

  const removeVariant = (index: number) => {
    const currentVariants = [...(values.variants || [])];
    currentVariants.splice(index, 1);
    setFieldValue('variants', currentVariants);
  };

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        await $fetch(`/api/product/add`, {
          method: 'POST',
          body: values,
        });
        await refreshNuxtData('products');
        resetForm();
        toast({
          title: 'Producto creado exitosamente',
        });
      } catch (e) {
        const nuxtError = e as NuxtError<{ customField?: string }>;
        if (nuxtError.statusCode === 409) {
          toast({
            variant: 'destructive',
            title: 'Error al crear el producto',
            description: nuxtError.statusMessage,
            action: h(
              ToastAction,
              { altText: 'Ver carrito', asChild: true },
              {
                default: () =>
                  h(
                    NuxtLink,
                    { to: `/products/${nuxtError.data.data.existingProductId}` },
                    { default: () => 'Ver' }
                  ),
              }
            ),
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Error al crear el producto',
            description: nuxtError.message,
          });
        }
      }
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

  return {
    mode,
    filteredBrands,
    filteredCategories,
    createBrand,
    createCategory,
    handleCategoryToggle,
    validate,
    setErrors,
    meta,
    addVariant,
    removeVariant,
    checkIfVariantExists,
    brandOpen,
    brandSearchTerm,
    categoryOpen,
    categorySearchTerm,
    values,
    setFieldValue,
    resetForm,
    isSubmitting,
    product,
    variants,
    onSubmit,
    errors,
  };
}
