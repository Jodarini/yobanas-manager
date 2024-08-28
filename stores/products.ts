import { defineStore } from "pinia";
import type { Product, ProductsResponse } from "~/types/types";

export const useProductsStore = defineStore("products", () => {
  const products = ref<Product[]>();
  const filterText = ref("");
  const filterCategory = ref("Todos");

  async function fetchProducts() {
    const { data, status, error } = await useFetch<Product[]>("/api/products");
    products.value = data.value!;
    return { status, error };
  }

  async function fetchProduct(productId: number) {
    const { data, status, error } = await useFetch<Product>(
      `/api/product/${productId}`,
    );
    return { data, status, error };
  }

  const filteredProducts = computed(() => {
    if (!filterText) return products.value;
    return products.value?.filter((product) =>
      filterCategory.value === "Todos"
        ? product.title.toLowerCase().includes(filterText.value.toLowerCase())
        : product.title
            .toLowerCase()
            .includes(filterText.value.toLowerCase()) &&
          product.category === filterCategory.value,
    );
  });

  const productCategories = computed(() => {
    let categories = new Set<string>(["Todos"]);
    products.value?.forEach((product) => {
      categories.add(product.category);
    });
    return Array.from(categories);
  });

  return {
    products,
    fetchProducts,
    fetchProduct,
    filteredProducts,
    filterText,
    productCategories,
    filterCategory,
  };
});
