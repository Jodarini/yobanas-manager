import { toTypedSchema } from '@vee-validate/zod';
import { useForm, useFieldArray } from 'vee-validate';
import { normalizeString } from '~/lib/utils';
import { updateVariantSchema, type UpdateVariant } from '~~/db/schema';

export function useVariantsFormState(data?: UpdateVariant) {
  const { setHasVariants } = useProductState();
  const formSchema = toTypedSchema(updateVariantSchema);

  const form = useForm({
    validationSchema: formSchema,
    initialValues: {
      variants: data?.variants || undefined,
      productSKU: '',
    },
  });

  if (data?.variants?.length > 0) {
    setHasVariants(true);
  }

  const { remove, push, fields, update } = useFieldArray('variants');

  const checkIfVariantExists = () => {
    const currentVariants = form.values.variants || [];
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
    push({
      id: undefined,
      size: '',
      color: '',
      stock: 0,
    });
    setHasVariants(true);
  };

  const removeVariant = (index: number) => {
    remove(index);
    if (fields.value.length === 0) {
      setHasVariants(false);
    }
  };

  return {
    handleSubmit: form.handleSubmit,
    values: form.values,
    setFieldValue: form.setFieldValue,
    resetForm: form.resetForm,
    isSubmitting: form.isSubmitting,
    setErrors: form.setErrors,
    meta: form.meta,
    validate: form.validate,
    errors: form.errors,
    addVariant,
    removeVariant,
    fields,
    checkIfVariantExists,
    update,
  };
}
