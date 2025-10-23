import { defineStore } from 'pinia';
import type { InsertProduct } from '~/db/schema';

export const useProductsStore = defineStore('products', () => {
  const filterText = ref('');
  const filterCategory = ref('Todos');

  async function addProduct(prod: InsertProduct) {
    const result = await $fetch(`/api/product/add`, {
      method: 'POST',
      body: prod,
    });

    if (result.product) {
      const p = {
        title: prod.title,
        brand: prod.brand,
        price: prod.price,
        category: prod.category,
        thumbnail: prod.thumbnail,
      };
    }
    return result;
  }

  async function deleteProduct(productId: number) {
    return await $fetch(`/api/product/${productId}`, {
      method: 'delete',
      body: productId,
    });
  }

  const filteredProducts = computed(() => {
    if (!filterText) return productsData.value;
    return productsData.value?.filter((prod) =>
      filterCategory.value === 'Todos'
        ? prod.title.toLowerCase().includes(filterText.value.toLowerCase())
        : prod.title.toLowerCase().includes(filterText.value.toLowerCase()) &&
          prod.category?.includes(filterCategory.value)
    );
  });

  return {
    addProduct,
    deleteProduct,
    filteredProducts,
    filterText,
    filterCategory,
  };
});
