import { defineStore } from 'pinia';
import type { InsertProduct } from '~/db/schema';

export const useProductsStore = defineStore('products', () => {
  async function addProduct(prod: InsertProduct) {
    const result = await $fetch(`/api/product/add`, {
      method: 'POST',
      body: prod,
    });

    return result;
  }

  async function deleteProduct(productId: number) {
    return await $fetch(`/api/product/${productId}`, {
      method: 'delete',
    });
  }

  return {
    addProduct,
    deleteProduct,
  };
});
