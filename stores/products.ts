import { defineStore } from "pinia";

interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  images: string[];
}

interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export const useProductsStore = defineStore("products", () => {
  const products = ref<Product[]>();
  const filterText = ref("");
  const filterCategory = ref("All");

  async function fetchProducts() {
    const {
      data: productsResponse,
      status,
      error,
    } = await useFetch<ProductsResponse>("https://dummyjson.com/products");
    products.value = productsResponse.value?.products;
    return { status, error };
  }

  const filteredProducts = computed(() => {
    if (!filterText) return products.value;
    return products.value?.filter((product) =>
      filterCategory.value === "All"
        ? product.title.toLowerCase().includes(filterText.value.toLowerCase())
        : product.title
            .toLowerCase()
            .includes(filterText.value.toLowerCase()) &&
          product.category === filterCategory.value,
    );
  });

  const productCategories = computed(() => {
    let categories = new Set<string>(["All"]);
    products.value?.forEach((product) => {
      categories.add(product.category);
    });
    return Array.from(categories);
  });

  return {
    products,
    fetchProducts,
    filteredProducts,
    filterText,
    productCategories,
    filterCategory,
  };
});
