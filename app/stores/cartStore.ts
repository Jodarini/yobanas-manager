import { type ProductVariant, type ProductWithVariants } from "~~/db/schema"


export const useCartStore = defineStore('cart', () => {
  type CartProduct = {
    title: string
    id: number
    variant: ProductVariant

  }
  const cart = ref<CartProduct[]>([])

  function addItem(item: CartProduct) {
    console.log({ item })
    cart.value.push(item)
    console.log(cart.value)
  }

  function removeItem(id: number) {
    cart.value = cart.value.filter(product => product.id !== id)
  }

  return { cart, addItem, removeItem }


})
