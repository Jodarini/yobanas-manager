import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { normalizeString } from "~/lib/utils";
import { updateVariantSchema, type UpdateVariant } from "~~/db/schema";

export function useVariantsFormState(data?: UpdateVariant) {

  const formSchema = toTypedSchema(updateVariantSchema);

  const { handleSubmit, values, setFieldValue, resetForm, isSubmitting,
    setErrors, meta, validate } =
    useForm({
      validationSchema: formSchema,
      initialValues: {
        variants: data?.variants || [{
          color: 'test',
          size: 'test',
          stock: 1,
        }],
      }
    });

  const checkIfVariantExists = () => {
    const currentVariants = values.variants || [];
    const seen = new Map()

    for (let i = 0; i < currentVariants.length; i++) {
      const variant = currentVariants[i]
      const key = `${normalizeString(variant!.size)}-${normalizeString(variant!.color)}`;

      if (seen.has(key)) {
        return i
      }
      seen.set(key, i)
    }

    return -1

  }

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

  return {
    handleSubmit,
    values,
    setFieldValue,
    resetForm,
    isSubmitting,
    addVariant,
    removeVariant,
    checkIfVariantExists,
    meta,
    setErrors,
    validate
  }
}
