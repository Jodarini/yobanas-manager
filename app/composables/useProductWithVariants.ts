
export function useProductWithVariants(mode: 'ADD' | 'EDIT', brands: string[], categories: string[], productId?: string) {
  const productForm = useProductFormState(brands, categories);
  const variantsForm = useVariantsFormState();

  const handleAddMode = async () => {
    // Validate both forms - cleaner approach
    const productValidation = await productForm.validate();
    const variantsValidation = await variantsForm.validate();

    console.log(productValidation)
    console.log(variantsValidation)

    if (!productValidation.valid || !variantsValidation.valid) {
      return { success: false };
    }

    const combined = {
      product: productForm.values,
      variants: variantsForm.values.variants,
    };

    await $fetch('/api/product', {
      method: 'post',
      body: combined,
    });

    productForm.resetForm();
    variantsForm.resetForm();

    return { success: true };
  };

  const handleEditProductOnly = productForm.handleSubmit(async (values) => {
    await $fetch(`/api/product/${productId}`, {
      method: 'put',
      body: values,
    });
  });

  const handleEditVariantsOnly = variantsForm.handleSubmit(async (values) => {
    await $fetch(`/api/product/${productId}/variants`, {
      method: 'put',
      body: values.variants,
    });
  });

  return {
    mode,
    productForm,
    variantsForm,
    handleAddMode,
    handleEditProductOnly,
    handleEditVariantsOnly
  };
}
