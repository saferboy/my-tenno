import { create } from 'zustand'
import type { Locale } from '../../../main/db/types'
import { useToastStore } from './useToastStore'
import { describeError } from '../i18n/errorMessage'

interface UserProfileState {
  loading: boolean
  masteryRank: number
  locale: Locale
  init: () => Promise<void>
  setMasteryRank: (masteryRank: number) => Promise<void>
  setLocale: (locale: Locale) => Promise<void>
}

export const useUserProfileStore = create<UserProfileState>((set) => ({
  loading: true,
  masteryRank: 0,
  locale: 'uz',

  init: async () => {
    try {
      const profile = await window.api.getUserProfile()
      set({ masteryRank: profile.masteryRank, locale: profile.locale, loading: false })
    } catch (error) {
      set({ loading: false })
      useToastStore.getState().show(describeError(error))
    }
  },

  setMasteryRank: async (masteryRank) => {
    try {
      const updated = await window.api.updateUserProfile({ masteryRank })
      set({ masteryRank: updated.masteryRank })
    } catch (error) {
      useToastStore.getState().show(describeError(error))
    }
  },

  setLocale: async (locale) => {
    try {
      const updated = await window.api.updateUserProfile({ locale })
      set({ locale: updated.locale })
    } catch (error) {
      useToastStore.getState().show(describeError(error))
    }
  }
}))
