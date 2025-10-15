import { defineStore } from 'pinia';
import type { InsertProduct } from '~/db/schema';

export const useProductsStore = defineStore('products', () => {
  const filterText = ref('');
  const filterCategory = ref('Todos');

  const { data: productsData, status: productsStatus, error: productsError, refresh: refreshProducts } =
    useFetch(`/api/products`,
      { key: 'products' });

  const productCategories = computed(() => {

    const s = new Set<string>()

    productsData.value?.forEach(product => product.category?.forEach(c => { s.add(c) }))

    return Array.from(s)

  })

  async function addProduct(prod: InsertProduct) {

    const result = await $fetch(`/api/product/add`, {
      method: 'POST',
      body: prod
    });

    if (result.product) {
      const p = {
        title: prod.productInfo.title,
        brand: prod.productInfo.brand,
        price: prod.productInfo.price,
        category: prod.productInfo.category,
        thumbnail: prod.productInfo.thumbnail,
      };
      productsData.value?.push(p);
    }
    return result
  }

  async function deleteProduct(productId: number) {
    return await $fetch(`/api/product/${productId}`, { method: 'delete', body: productId })
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

  const productBrands = computed(() => {
    const brands = new Set<string>([]);
    productsData.value?.forEach((prod) => {
      brands.add(prod.brand);
    });
    return Array.from(brands);
  });

  return {
    productsData,
    productsError,
    productsStatus,
    refreshProducts,
    addProduct,
    deleteProduct,
    filteredProducts,
    filterText,
    productCategories,
    productBrands,
    filterCategory,
  };
});
