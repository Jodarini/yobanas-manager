import { type ProductVariant, type ProductWithVariants } from "~~/db/schema"
import { toast } from '~/components/ui/toast'


export const useCartStore = defineStore('cart', () => {

  type CartProduct = {
    title: string
    id: number
    variant: ProductVariant
    stock: number
  }

  const cart = ref<CartProduct[]>([])


  function addItem(item: CartProduct) {
    const productIsAlreadyInCart = cart.value.find(product => product.variant.id === item.variant.id)
    if (productIsAlreadyInCart) {
      if (productIsAlreadyInCart.stock + item.stock > item.variant.stock) {
        item.stock = item.variant.stock
        toast({
          variant: 'destructive',
          title: 'No hay stock suficiente',
        });
        return
      }
      productIsAlreadyInCart.stock += item.stock
      return
    }
    cart.value.unshift(item)
  }

  function removeItem(id: number) {
    cart.value = cart.value.filter(product => product.id !== id)
  }

  return { cart, addItem, removeItem }


})
