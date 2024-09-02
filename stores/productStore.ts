import { defineStore } from "pinia";
import type { Product } from "~/db/schema";

export interface IProduct extends Omit<Product, "price" | "stock"> {
  price: number;
  stock: number;
}
export const useProductsStore = defineStore("products", () => {
  const products = ref<IProduct[]>();
  const filterText = ref("");
  const filterCategory = ref("Todos");

  async function fetchProducts() {
    const { data, status, error } = await useFetch<Product[]>("/api/products");

    if (data.value) {
      products.value = data.value.map((product) => ({
        ...product,
        price: parseInt(product.price) as number,
        stock: parseInt(product.stock) as number,
      }));
    }
    // data.value = { ...data.value, price: parseInt(price) };
    // products.value = data.value;
    return { status, error };
  }

  async function fetchProduct(productId: number) {
    const { data, status, error } = await useFetch<Product>(
      `/api/product/${productId}`,
    );
    return { data, status, error };
  }

  async function addProduct(product: Product) {
    const prod = {
      ...product,
      price: parseInt(product.price),
      stock: parseInt(product.stock),
    };
    products.value?.push(prod);
  }

  const filteredProducts = computed(() => {
    if (!filterText) return products.value;
    return products.value?.filter((product) =>
      filterCategory.value === "Todos"
        ? product.title.toLowerCase().includes(filterText.value.toLowerCase())
        : product.title
            .toLowerCase()
            .includes(filterText.value.toLowerCase()) &&
          product.category?.includes(filterCategory.value),
    );
  });

  const productCategories = computed(() => {
    const categories = new Set<string>(["Todos"]);
    products.value?.forEach((product) => {
      product.category?.forEach((cat) => categories.add(cat));
    });
    return Array.from(categories);
  });

  return {
    products,
    fetchProducts,
    fetchProduct,
    addProduct,
    filteredProducts,
    filterText,
    productCategories,
    filterCategory,
  };
});
