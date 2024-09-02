import { defineStore } from "pinia";
import type { Product } from "~/db/schema";

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

  interface AddProduct extends Omit<Product, "price" | "stock"> {
    price: number;
    stock: number;
  }

  async function addProduct(product: AddProduct) {
    const prod = await $fetch("/api/product/add", {
      method: "post",
      body: { product },
    });
    return prod;
  }

  // async function deleteProduct(id: number) {
  //   isPending.value = true;
  //   storeError.value = "";
  //   try {
  //     await new Promise((resolve) => setTimeout(resolve, 2000));
  //     await $fetch("/api/product/delete", {
  //       method: "delete",
  //       body: { id },
  //     });
  //
  //     products.value = products.value!.filter((product) => product.id !== id);
  //   } catch (err) {
  //     if (err.statusCode === 404) {
  //       storeError.value = "Producto no encontrado";
  //     } else {
  //       storeError.value = "Ocurrio un error";
  //     }
  //   } finally {
  //     isPending.value = false;
  //   }
  // }

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
