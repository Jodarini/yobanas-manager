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
  async function fetchProducts() {
    const {
      data: productsResponse,
      status,
      error,
    } = await useFetch<ProductsResponse>("https://dummyjson.com/products");
    products.value = productsResponse.value?.products;
    return { status, error };
  }

  return { products, fetchProducts };
});
