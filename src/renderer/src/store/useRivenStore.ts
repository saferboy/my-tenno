import { create } from 'zustand'
import type { RivenMod, RivenModInput, RivenModPatch } from '../../../main/db/types'
import { useToastStore } from './useToastStore'
import { describeError } from '../i18n/errorMessage'

interface RivenState {
  loading: boolean
  rivens: RivenMod[]
  init: () => Promise<void>
  addRiven: (input: RivenModInput) => Promise<void>
  updateRiven: (id: number, patch: RivenModPatch) => Promise<void>
  removeRiven: (id: number) => Promise<void>
}

export const useRivenStore = create<RivenState>((set) => ({
  loading: true,
  rivens: [],

  init: async () => {
    try {
      const rivens = await window.api.getRivenMods()
      set({ rivens, loading: false })
    } catch (error) {
      set({ loading: false })
      useToastStore.getState().show(describeError(error))
    }
  },

  addRiven: async (input) => {
    try {
      const riven = await window.api.addRivenMod(input)
      set((state) => ({ rivens: [riven, ...state.rivens] }))
    } catch (error) {
      useToastStore.getState().show(describeError(error))
    }
  },

  updateRiven: async (id, patch) => {
    try {
      const updated = await window.api.updateRivenMod(id, patch)
      set((state) => ({ rivens: state.rivens.map((r) => (r.id === id ? updated : r)) }))
    } catch (error) {
      useToastStore.getState().show(describeError(error))
    }
  },

  removeRiven: async (id) => {
    try {
      await window.api.deleteRivenMod(id)
      set((state) => ({ rivens: state.rivens.filter((r) => r.id !== id) }))
    } catch (error) {
      useToastStore.getState().show(describeError(error))
    }
  }
}))
