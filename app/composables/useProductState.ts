const hasVariants = ref(false);
export function useProductState() {
  const setHasVariants = (value: boolean) => {
    hasVariants.value = value;
  };

  return {
    hasVariants: readonly(hasVariants), // Optional: make it readonly
    setHasVariants,
  };
}
