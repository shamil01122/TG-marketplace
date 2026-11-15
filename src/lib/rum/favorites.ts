import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RumFavorite {
  id: number
  name: string
  model: string
  emoji: string
  price: number
  rarity: string
  category: 'rare' | 'limited' | 'popular'
  color: string
  number: string
}

interface FavoritesStore {
  items: RumFavorite[]
  toggleFavorite: (gift: RumFavorite) => void
  isFavorite: (id: number) => boolean
  clear: () => void
}

export const useRumFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleFavorite: (gift) =>
        set((state) => ({
          items: state.items.some((item) => item.id === gift.id)
            ? state.items.filter((item) => item.id !== gift.id)
            : [...state.items, gift],
        })),
      isFavorite: (id) => get().items.some((item) => item.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: 'rum-favorites' },
  ),
)
