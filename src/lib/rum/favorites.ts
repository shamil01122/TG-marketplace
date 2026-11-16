import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RumFavorite {
  listingId: string
}

interface FavoritesStore {
  items: RumFavorite[]
  toggleFavorite: (listingId: string) => void
  isFavorite: (listingId: string) => boolean
  clear: () => void
}

export const useRumFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggleFavorite: (listingId) =>
        set((state) => ({
          items: state.items.some((item) => item.listingId === listingId)
            ? state.items.filter((item) => item.listingId !== listingId)
            : [...state.items, { listingId }],
        })),

      isFavorite: (listingId) =>
        get().items.some((item) => item.listingId === listingId),

      clear: () => set({ items: [] }),
    }),
    { name: 'rum-favorites-v2' },
  ),
)
