import { create } from 'zustand'
import { useToastStore } from './useToastStore'

interface UserProfileState {
  loading: boolean
  masteryRank: number
  init: () => Promise<void>
  setMasteryRank: (masteryRank: number) => Promise<void>
}

export const useUserProfileStore = create<UserProfileState>((set) => ({
  loading: true,
  masteryRank: 0,

  init: async () => {
    try {
      const profile = await window.api.getUserProfile()
      set({ masteryRank: profile.masteryRank, loading: false })
    } catch (error) {
      set({ loading: false })
      useToastStore.getState().show(error instanceof Error ? error.message : String(error))
    }
  },

  setMasteryRank: async (masteryRank) => {
    try {
      const updated = await window.api.updateUserProfile({ masteryRank })
      set({ masteryRank: updated.masteryRank })
    } catch (error) {
      useToastStore.getState().show(error instanceof Error ? error.message : String(error))
    }
  }
}))
