import { create } from 'zustand'
import type { QuestStatus } from '../../../main/db/types'
import { useToastStore } from './useToastStore'
import { describeError } from '../i18n/errorMessage'

interface QuestState {
  loading: boolean
  statusByQuest: Record<string, QuestStatus>
  init: () => Promise<void>
  toggleCompleted: (questUniqueName: string, completed: boolean) => Promise<void>
}

// Kvest ro'yxatining o'zi useAppStore.items'dan (category === 'Quests')
// olinadi - faqat bajarilganlik holati shu yerda saqlanadi.
export const useQuestStore = create<QuestState>((set) => ({
  loading: true,
  statusByQuest: {},

  init: async () => {
    try {
      const statuses = await window.api.getQuestStatuses()
      const statusByQuest: Record<string, QuestStatus> = {}
      for (const status of statuses) {
        statusByQuest[status.questUniqueName] = status
      }
      set({ statusByQuest, loading: false })
    } catch (error) {
      set({ loading: false })
      useToastStore.getState().show(describeError(error))
    }
  },

  toggleCompleted: async (questUniqueName, completed) => {
    try {
      const updated = await window.api.updateQuestStatus(questUniqueName, completed)
      set((state) => ({ statusByQuest: { ...state.statusByQuest, [questUniqueName]: updated } }))
    } catch (error) {
      useToastStore.getState().show(describeError(error))
    }
  }
}))
