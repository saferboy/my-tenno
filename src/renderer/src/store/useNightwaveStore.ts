import { create } from 'zustand'
import type { NightwaveChallenge, NightwaveChallengeInput } from '../../../main/db/types'
import { useToastStore } from './useToastStore'

interface NightwaveState {
  loading: boolean
  challenges: NightwaveChallenge[]
  init: () => Promise<void>
  addChallenge: (input: NightwaveChallengeInput) => Promise<void>
  toggleCompleted: (id: number, completed: boolean) => Promise<void>
  removeChallenge: (id: number) => Promise<void>
}

export const useNightwaveStore = create<NightwaveState>((set) => ({
  loading: true,
  challenges: [],

  init: async () => {
    try {
      const challenges = await window.api.getNightwaveChallenges()
      set({ challenges, loading: false })
    } catch (error) {
      set({ loading: false })
      useToastStore.getState().show(error instanceof Error ? error.message : String(error))
    }
  },

  addChallenge: async (input) => {
    try {
      const challenge = await window.api.addNightwaveChallenge(input)
      set((state) => ({ challenges: [...state.challenges, challenge] }))
    } catch (error) {
      useToastStore.getState().show(error instanceof Error ? error.message : String(error))
    }
  },

  toggleCompleted: async (id, completed) => {
    try {
      const updated = await window.api.setNightwaveChallengeCompleted(id, completed)
      set((state) => ({ challenges: state.challenges.map((c) => (c.id === id ? updated : c)) }))
    } catch (error) {
      useToastStore.getState().show(error instanceof Error ? error.message : String(error))
    }
  },

  removeChallenge: async (id) => {
    try {
      await window.api.deleteNightwaveChallenge(id)
      set((state) => ({ challenges: state.challenges.filter((c) => c.id !== id) }))
    } catch (error) {
      useToastStore.getState().show(error instanceof Error ? error.message : String(error))
    }
  }
}))
