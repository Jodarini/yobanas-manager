import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'
import ProductsPage from '../../app/pages/products/index.vue'

const { useFetchMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn()
}))
mockNuxtImport('useSupabaseClient', () => {
  return () => ({
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn()
    }
  })
})

mockNuxtImport('useFetch', () => useFetchMock)

describe('Products Page', () => {
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

    expect(component.find('h1').text()).toBe('Sus productos')
  })

  it('shows empty state when user has no products', async () => {
    useFetchMock.mockReturnValue({
      data: ref([]),
      refresh: vi.fn(),
      error: ref(null),
      status: ref('success')
    })

    const component = await mountSuspended(ProductsPage)

    expect(component.text()).toContain('¡Agrega nuevos items a tu inventario!')
  })

  it('shows DataTable when user has products', async () => {
    const mockProducts = [
      {
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
        sold_count: 0
      }
    ]

    useFetchMock.mockReturnValue({
      data: ref(mockProducts),
      refresh: vi.fn(),
      error: ref(null),
      status: ref('success')
    })

    const component = await mountSuspended(ProductsPage)

    expect(component.find('h1').text()).toBe('Sus productos')
    expect(component.text()).toContain('Gorra clásica')
  })

  it('shows loading spinner when fetching', async () => {
    useFetchMock.mockReturnValue({
      data: ref(null),
      refresh: vi.fn(),
      error: ref(null),
      status: ref('pending')
    })

    const component = await mountSuspended(ProductsPage)

    expect(component.text()).toContain('Cargando producto...')
  })
})

