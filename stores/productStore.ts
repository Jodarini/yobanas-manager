import { defineStore } from 'pinia';
import type { Product, ProductVariants, ProductWithVariant } from '~/db/schema';

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>();
  const filterText = ref('');
  const filterCategory = ref('Todos');

  async function fetchProducts() {
    const { data, status, error } = await useFetch<Product[]>('/api/products');

    if (data.value) {
      products.value = data.value.map((prod) => ({
        id: prod.id,
        title: prod.title,
        brand: prod.brand,
        price: prod.price,
        category: prod.category,
        thumbnail: prod.thumbnail,
      }));
    }
    return { status, error };
  }

  // async function fetchProduct(productId: number) {
  //   const { data, status, error, pending, refresh } = await useFetch(
  //     `/api/product/${productId}`,
  //     {}
  //   );
  //   return { data, status, error, pending, refresh };
  // }

  async function fetchProduct(productId: number) {
    return await useFetch(`/api/product/${productId}`, {
      key: `product-${productId}`, // Important for caching and deduplication
      server: true, // Ensures server-side execution
    });
  }
  async function addProduct(prod: ProductWithVariant) {
    const p = {
      id: prod.productInfo.id,
      title: prod.productInfo.title,
      brand: prod.productInfo.brand,
      price: prod.productInfo.price,
      category: prod.productInfo.category,
      thumbnail: prod.productInfo.thumbnail,
    };
    products.value?.push(p);
  }

  const filteredProducts = computed(() => {
    if (!filterText) return products.value;
    return products.value?.filter((prod) =>
      filterCategory.value === 'Todos'
        ? prod.title.toLowerCase().includes(filterText.value.toLowerCase())
        : prod.title.toLowerCase().includes(filterText.value.toLowerCase()) &&
          prod.category?.includes(filterCategory.value)
    );
  });

  const productCategories = computed(() => {
    const categories = new Set<string>(['Todos']);
    products.value?.forEach((prod) => {
      prod.category?.forEach((cat) => categories.add(cat));
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
