import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RumCartItem {
  giftId: string
  name: string
  priceTon: number
  image: string
  collection: string
  model: string
  rarity: string
  qty: number
}

interface RumCartStore {
  items: RumCartItem[]
  addGift: (gift: Omit<RumCartItem, 'qty'>) => void
  removeGift: (giftId: string) => void
  updateQty: (giftId: string, qty: number) => void
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
          const existing = state.items.find((item) => item.giftId === gift.giftId)

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.giftId === gift.giftId
                  ? { ...item, qty: item.qty + 1 }
                  : item,
              ),
            }
          }

          return { items: [...state.items, { ...gift, qty: 1 }] }
        }),

      removeGift: (giftId) =>
        set((state) => ({
          items: state.items.filter((item) => item.giftId !== giftId),
        })),

      updateQty: (giftId, qty) =>
        set((state) => ({
          items: qty <= 0
            ? state.items.filter((item) => item.giftId !== giftId)
            : state.items.map((item) =>
                item.giftId === giftId ? { ...item, qty } : item,
              ),
        })),

      clear: () => set({ items: [] }),

      totalTon: () =>
        get().items.reduce((sum, item) => sum + item.priceTon * item.qty, 0),

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.qty, 0),
    }),
    { name: 'rum-cart' },
  ),
)
