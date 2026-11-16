import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RumCartItem {
  listingId: string
  name: string
  priceTon: number
  imageUrl: string
  collection: string
  model: string
  qty: 1
}

interface RumCartStore {
  items: RumCartItem[]
  addGift: (gift: Omit<RumCartItem, 'qty'>) => void
  removeGift: (listingId: string) => void
  clear: () => void
  totalTon: () => number
  itemCount: () => number
}

export const useRumCart = create<RumCartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addGift: (gift) =>
        set((state) => {
          if (state.items.some((item) => item.listingId === gift.listingId)) {
            return state
          }

          return {
            items: [...state.items, { ...gift, qty: 1 }],
          }
        }),

      removeGift: (listingId) =>
        set((state) => ({
          items: state.items.filter((item) => item.listingId !== listingId),
        })),

      clear: () => set({ items: [] }),

      totalTon: () =>
        get().items.reduce((sum, item) => sum + item.priceTon, 0),

      itemCount: () => get().items.length,
    }),
    { name: 'rum-cart-v2' },
  ),
) 
