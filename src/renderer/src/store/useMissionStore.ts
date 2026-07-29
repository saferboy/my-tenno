import { create } from 'zustand'
import type { MissionNode } from '../../../main/masterData/nodes'
import type { MissionStatus } from '../../../main/db/types'
import { useToastStore } from './useToastStore'

interface MissionState {
  loading: boolean
  nodes: MissionNode[]
  statusByNode: Record<string, MissionStatus>
  init: () => Promise<void>
  toggleCompleted: (nodeUniqueName: string, completed: boolean) => Promise<void>
}

export const useMissionStore = create<MissionState>((set) => ({
  loading: true,
  nodes: [],
  statusByNode: {},

  init: async () => {
    try {
      const [nodes, statuses] = await Promise.all([window.api.getNodes(), window.api.getMissionStatuses()])

      const statusByNode: Record<string, MissionStatus> = {}
      for (const status of statuses) {
        statusByNode[status.nodeUniqueName] = status
      }

      set({ nodes, statusByNode, loading: false })
    } catch (error) {
      set({ loading: false })
      useToastStore.getState().show(error instanceof Error ? error.message : String(error))
    }
  },

  toggleCompleted: async (nodeUniqueName, completed) => {
    try {
      const updated = await window.api.updateMissionStatus(nodeUniqueName, completed)
      set((state) => ({ statusByNode: { ...state.statusByNode, [nodeUniqueName]: updated } }))
    } catch (error) {
      useToastStore.getState().show(error instanceof Error ? error.message : String(error))
    }
  }
}))
