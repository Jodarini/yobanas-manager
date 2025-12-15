import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'
import ProductsPage from '../../app/pages/products/[id].vue'

const { useFetchMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn()
}))
// mockNuxtImport('useSupabaseClient', () => {
//   return () => ({
//     from: vi.fn(),
//     auth: {
//       getSession: vi.fn(),
//       signIn: vi.fn(),
//       signOut: vi.fn()
//     }
//   })
// })

mockNuxtImport('useFetch', () => useFetchMock)

describe('Product Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays "Sus productos" heading', async () => {
    useFetchMock.mockReturnValue({
      data: ref([]),
      refresh: vi.fn(),
      error: ref(null),
      status: ref('success')
    })

    const component = await mountSuspended(ProductsPage)

    expect(component.find('h3').text()).toBe('Información del Producto')
  })


  it('shows the product name in the title input', async () => {
    const mockProduct = {
      id: 5,
      sku: "CAP-ACC-GORRACLASICA",
      user_id: "f2355eff-89c0-40f9-bd72-7d2d41b27ae8",
      title: "Gorra clásica",
      description: "Gorra ajustable de 6 paneles con visera curva.",
      price: "45000.00",
      thumbnail: "https://picsum.photos/seed/gorra1/640/480",
      brand: "CapStyle",
      category: ["accesorios", "gorras"],
      stock: null,
      sold_count: 0,
      variants: []
    }

    useFetchMock.mockImplementation((url: string) => {
      if (url.includes('/api/product/')) {
        return {
          data: ref(mockProduct),
          refresh: vi.fn(),
          error: ref(null),
          status: ref('success')
        }
      }

      if (url === '/api/products') {
        return {
          data: ref([mockProduct]),
          refresh: vi.fn(),
          error: ref(null),
          status: ref('success')
        }
      }

    })

    const component = await mountSuspended(ProductsPage)

    // Check the input element's value attribute
    const titleInput = component.find('input[name="title"]')
    expect(titleInput.element.value).toBe('Gorra clásica')

    // Or verify the brand appears in visible text (it does!)
    expect(component.text()).toContain('CapStyle')
  })
})


