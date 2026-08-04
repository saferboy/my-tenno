import { create } from 'zustand'
import type { Locale } from '../../../main/db/types'
import { useToastStore } from './useToastStore'
import { describeError } from '../i18n/errorMessage'

interface UserProfileState {
  loading: boolean
  masteryRank: number
  credits: number
  platinum: number
  locale: Locale
  lastSeenChangelogVersion: string
  init: () => Promise<void>
  setMasteryRank: (masteryRank: number) => Promise<void>
  setCredits: (credits: number) => Promise<void>
  setPlatinum: (platinum: number) => Promise<void>
  setLocale: (locale: Locale) => Promise<void>
  setLastSeenChangelogVersion: (version: string) => Promise<void>
}

export const useUserProfileStore = create<UserProfileState>((set) => ({
  loading: true,
  masteryRank: 0,
  credits: 0,
  platinum: 0,
  locale: 'uz',
  lastSeenChangelogVersion: '',

  init: async () => {
    try {
      const profile = await window.api.getUserProfile()
      set({
        masteryRank: profile.masteryRank,
        credits: profile.credits,
        platinum: profile.platinum,
        locale: profile.locale,
        lastSeenChangelogVersion: profile.lastSeenChangelogVersion,
        loading: false
      })
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

  setCredits: async (credits) => {
    try {
      const updated = await window.api.updateUserProfile({ credits })
      set({ credits: updated.credits })
    } catch (error) {
      useToastStore.getState().show(describeError(error))
    }
  },

  setPlatinum: async (platinum) => {
    try {
      const updated = await window.api.updateUserProfile({ platinum })
      set({ platinum: updated.platinum })
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
  },

  setLastSeenChangelogVersion: async (lastSeenChangelogVersion) => {
    try {
      const updated = await window.api.updateUserProfile({ lastSeenChangelogVersion })
      set({ lastSeenChangelogVersion: updated.lastSeenChangelogVersion })
    } catch (error) {
      useToastStore.getState().show(describeError(error))
    }
  }
}))
