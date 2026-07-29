import { contextBridge, ipcRenderer } from 'electron'
import type { MasterDataPayload } from '../main/masterData/types'
import type { MissionNode } from '../main/masterData/nodes'
import type { ItemStatus, ItemStatusPatch, MissionStatus } from '../main/db/types'
import type { BackupInfo } from '../main/db/backup'

// TDD 7.1: faqat oldindan belgilangan, cheklangan metodlar ochiladi - to'liq
// ipcRenderer obyekti hech qachon renderer'ga uzatilmaydi.
const api = {
  getMasterData: (): Promise<MasterDataPayload> => ipcRenderer.invoke('masterData:get'),
  getSchemaVersion: (): Promise<number> => ipcRenderer.invoke('db:getSchemaVersion'),
  getItemStatuses: (): Promise<ItemStatus[]> => ipcRenderer.invoke('itemStatus:getAll'),
  updateItemStatus: (itemUniqueName: string, patch: ItemStatusPatch): Promise<ItemStatus> =>
    ipcRenderer.invoke('itemStatus:update', itemUniqueName, patch),

  getNodes: (): Promise<MissionNode[]> => ipcRenderer.invoke('masterData:getNodes'),
  getMissionStatuses: (): Promise<MissionStatus[]> => ipcRenderer.invoke('missionStatus:getAll'),
  updateMissionStatus: (nodeUniqueName: string, completed: boolean): Promise<MissionStatus> =>
    ipcRenderer.invoke('missionStatus:update', nodeUniqueName, completed),

  createBackup: (): Promise<BackupInfo | null> => ipcRenderer.invoke('backup:create'),
  listBackups: (): Promise<BackupInfo[]> => ipcRenderer.invoke('backup:list'),
  restoreBackup: (fileName: string): Promise<void> => ipcRenderer.invoke('backup:restore', fileName),
  exportJson: (): Promise<{ saved: boolean; filePath: string | null }> => ipcRenderer.invoke('backup:exportJson')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
}

export type Api = typeof api
