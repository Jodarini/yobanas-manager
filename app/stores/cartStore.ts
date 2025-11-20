import type { Product, ProductVariant, checkoutItem } from '~~/db/schema';
import { toast } from '~/components/ui/toast';

export const useCartStore = defineStore('cart', () => {
  type CartProduct = {
    title: string;
    id: number;
    price: number;
    variant?: ProductVariant;
    product?: Product;
    stock: number;
  };

  const cart = ref<CartProduct[]>([]);

  function addItem(item: CartProduct) {
    const existingProduct = cart.value.find(
      (product) =>
        (product.variant?.id === item.variant?.id &&
          product.variant?.id !== undefined) ||
        (!product.variant && !item.variant && product.id === item.id)
    );

    if (existingProduct) {
      const maxStock = item.variant?.stock ?? item.stock;
      const newTotal = existingProduct.stock + item.stock;

      if (newTotal > maxStock) {
        toast({
          variant: 'destructive',
          title: 'No hay stock suficiente',
          description: `Solo hay ${maxStock} disponibles`,
        });
        existingProduct.stock = maxStock;
        return;
      }

      existingProduct.stock = newTotal;
      return;
    }

    cart.value.unshift(item);
  }

  function handleQuantityChange(id: number, quantity: number) {
    const product = cart.value.find(
      (product) => product.variant?.id === id || product.id === id
    );
    if (product) {
      const maxStock = product.variant?.stock ?? product.stock;

      product.stock = Math.min(quantity, maxStock);

      if (product.stock === 0) {
        removeItem(id);
      }
    }
  }

  function removeItem(id: number) {
    cart.value = cart.value.filter(
      (product) => product.variant?.id !== id && product.id !== id
    );
  }

  function emptyCart() {
    cart.value = [];
  }

  const totalPrice = computed(() => {
    return cart.value.reduce(
      (acc, product) => acc + product.price * product.stock,
      0
    );
  });

  async function checkout(items: checkoutItem[]) {
    try {
      const res = await $fetch('/api/sales', {
        method: 'POST',
        body: { items },
      });

      toast({
        title: 'Compra exitosa',
        description: 'Se han registrado los productos',
      });

      await refreshNuxtData('products');
      return { data: res, error: null };
    } catch (err) {
      console.error('Checkout error:', err);

      toast({
        variant: 'destructive',
        title: 'Error al procesar la compra',
        description: err instanceof Error ? err.message : 'Error desconocido',
      });

      return { data: null, error: err };
    }
  }

  return {
    cart,
    addItem,
    removeItem,
    totalPrice,
    handleQuantityChange,
    emptyCart,
    checkout,
  };
});
