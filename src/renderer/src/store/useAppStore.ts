import { create } from 'zustand'
import Fuse from 'fuse.js'
import type { WarframeItem } from '../../../main/masterData/types'
import type { ItemStatus, ItemStatusPatch } from '../../../main/db/types'
import { useToastStore } from './useToastStore'

export type StatusFilter = 'all' | 'owned' | 'maxed' | 'not-owned'

interface AppState {
  loading: boolean
  error: string | null
  items: WarframeItem[]
  dataVersion: string | null
  schemaVersion: number | null
  statusByItem: Record<string, ItemStatus>
  fuse: Fuse<WarframeItem> | null
  init: () => Promise<void>
  updateStatus: (itemUniqueName: string, patch: ItemStatusPatch) => Promise<void>
}

// TDD 4.1/5.2: Master Data faqat xotirada (Zustand), User Data IPC orqali
// SQLite'dan yuklanadi va shu yerda birlashtiriladi.
export const useAppStore = create<AppState>((set) => ({
  loading: true,
  error: null,
  items: [],
  dataVersion: null,
  schemaVersion: null,
  statusByItem: {},
  fuse: null,

  init: async () => {
    try {
      const [masterData, schemaVersion, statuses] = await Promise.all([
        window.api.getMasterData(),
        window.api.getSchemaVersion(),
        window.api.getItemStatuses()
      ])

      const statusByItem: Record<string, ItemStatus> = {}
      for (const status of statuses) {
        statusByItem[status.itemUniqueName] = status
      }

      const fuse = new Fuse(masterData.items, {
        keys: ['name', 'category'],
        threshold: 0.3
      })

      set({
        items: masterData.items,
        dataVersion: masterData.dataVersion,
        schemaVersion,
        statusByItem,
        fuse,
        loading: false
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false })
    }
  },

  updateStatus: async (itemUniqueName, patch) => {
    try {
      const updated = await window.api.updateItemStatus(itemUniqueName, patch)
      set((state) => ({
        statusByItem: { ...state.statusByItem, [itemUniqueName]: updated }
      }))
    } catch (error) {
      useToastStore.getState().show(error instanceof Error ? error.message : String(error))
    }
  }
}))
