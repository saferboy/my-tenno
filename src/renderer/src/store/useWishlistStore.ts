import { create } from 'zustand'
import type { WishlistItem, WishlistItemInput, WishlistItemPatch } from '../../../main/db/types'
import { useToastStore } from './useToastStore'

interface WishlistState {
  loading: boolean
  items: WishlistItem[]
  init: () => Promise<void>
  addItem: (input: WishlistItemInput) => Promise<void>
  updateItem: (id: number, patch: WishlistItemPatch) => Promise<void>
  removeItem: (id: number) => Promise<void>
}

export const useWishlistStore = create<WishlistState>((set) => ({
  loading: true,
  items: [],

  init: async () => {
    try {
      const items = await window.api.getWishlistItems()
      set({ items, loading: false })
    } catch (error) {
      set({ loading: false })
      useToastStore.getState().show(error instanceof Error ? error.message : String(error))
    }
  },

  addItem: async (input) => {
    try {
      const item = await window.api.addWishlistItem(input)
      set((state) => ({ items: [item, ...state.items] }))
    } catch (error) {
      useToastStore.getState().show(error instanceof Error ? error.message : String(error))
    }
  },

  updateItem: async (id, patch) => {
    try {
      const updated = await window.api.updateWishlistItem(id, patch)
      set((state) => ({ items: state.items.map((i) => (i.id === id ? updated : i)) }))
    } catch (error) {
      useToastStore.getState().show(error instanceof Error ? error.message : String(error))
    }
  },

  removeItem: async (id) => {
    try {
      await window.api.deleteWishlistItem(id)
      set((state) => ({ items: state.items.filter((i) => i.id !== id) }))
    } catch (error) {
      useToastStore.getState().show(error instanceof Error ? error.message : String(error))
    }
  }
}))
