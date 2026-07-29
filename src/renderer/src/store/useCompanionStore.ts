import { create } from 'zustand'
import type { CompanionStatus, FocusSchool, FocusSchoolPatch } from '../../../main/db/types'
import { useToastStore } from './useToastStore'

interface CompanionState {
  loading: boolean
  companionStatusByItem: Record<string, CompanionStatus>
  focusSchools: FocusSchool[]
  init: () => Promise<void>
  setDnaStability: (itemUniqueName: string, dnaStability: number | null) => Promise<void>
  updateFocusSchool: (schoolName: string, patch: FocusSchoolPatch) => Promise<void>
}

export const useCompanionStore = create<CompanionState>((set) => ({
  loading: true,
  companionStatusByItem: {},
  focusSchools: [],

  init: async () => {
    try {
      const [companionStatuses, focusSchools] = await Promise.all([
        window.api.getCompanionStatuses(),
        window.api.getFocusSchools()
      ])

      const companionStatusByItem: Record<string, CompanionStatus> = {}
      for (const status of companionStatuses) {
        companionStatusByItem[status.itemUniqueName] = status
      }

      set({ companionStatusByItem, focusSchools, loading: false })
    } catch (error) {
      set({ loading: false })
      useToastStore.getState().show(error instanceof Error ? error.message : String(error))
    }
  },

  setDnaStability: async (itemUniqueName, dnaStability) => {
    try {
      const updated = await window.api.setDnaStability(itemUniqueName, dnaStability)
      set((state) => ({
        companionStatusByItem: { ...state.companionStatusByItem, [itemUniqueName]: updated }
      }))
    } catch (error) {
      useToastStore.getState().show(error instanceof Error ? error.message : String(error))
    }
  },

  updateFocusSchool: async (schoolName, patch) => {
    try {
      const updated = await window.api.updateFocusSchool(schoolName, patch)
      set((state) => ({
        focusSchools: state.focusSchools.map((school) => (school.schoolName === schoolName ? updated : school))
      }))
    } catch (error) {
      useToastStore.getState().show(error instanceof Error ? error.message : String(error))
    }
  }
}))
