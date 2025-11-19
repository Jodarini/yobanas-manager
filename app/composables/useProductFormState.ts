import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { updateProductSchema2, type Product } from '~~/db/schema';

export function useProductFormState(
  brands: string[],
  categories: string[],
  product?: Product
) {
  const formSchema = toTypedSchema(updateProductSchema2);

  const {
    handleSubmit,
    values,
    setFieldValue,
    resetForm,
    isSubmitting,
    validate,
    meta,
  } = useForm({
    validationSchema: formSchema,
    initialValues: (product && {
      id: product.id,
      title: product.title,
      price: Number(product.price),
      brand: product.brand,
      category: product.category,
      description: product.description || undefined,
      thumbnail: product.thumbnail || undefined,
      stock: product.stock || undefined,
    }) || {
      title: 'test',
      description: 'test',
      price: 1000,
      category: ['test'],
      brand: 'testerino',
      stock: 1,
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

  return {
    handleSubmit,
    values,
    setFieldValue,
    resetForm,
    isSubmitting,
    brandOpen,
    brandSearchTerm,
    categoryOpen,
    categorySearchTerm,
    filteredBrands,
    filteredCategories,
    createBrand,
    createCategory,
    handleCategoryToggle,
    validate,
    meta,
  };
}
