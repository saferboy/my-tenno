import { contextBridge, ipcRenderer } from 'electron'
import type { MasterDataPayload } from '../main/masterData/types'
import type { ItemStatus, ItemStatusPatch } from '../main/db/types'

// TDD 7.1: faqat oldindan belgilangan, cheklangan metodlar ochiladi - to'liq
// ipcRenderer obyekti hech qachon renderer'ga uzatilmaydi.
const api = {
  getMasterData: (): Promise<MasterDataPayload> => ipcRenderer.invoke('masterData:get'),
  getSchemaVersion: (): Promise<number> => ipcRenderer.invoke('db:getSchemaVersion'),
  getItemStatuses: (): Promise<ItemStatus[]> => ipcRenderer.invoke('itemStatus:getAll'),
  updateItemStatus: (itemUniqueName: string, patch: ItemStatusPatch): Promise<ItemStatus> =>
    ipcRenderer.invoke('itemStatus:update', itemUniqueName, patch)
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
