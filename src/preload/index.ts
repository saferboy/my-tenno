import { contextBridge, ipcRenderer } from 'electron'
import type { MasterDataPayload } from '../main/masterData/types'
import type { MissionNode } from '../main/masterData/nodes'
import type {
  ItemStatus,
  ItemStatusPatch,
  MissionStatus,
  NightwaveChallenge,
  NightwaveChallengeInput,
  RivenMod,
  RivenModInput,
  RivenModPatch,
  CompanionStatus,
  FocusSchool,
  FocusSchoolPatch
} from '../main/db/types'
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

  getNightwaveChallenges: (): Promise<NightwaveChallenge[]> => ipcRenderer.invoke('nightwave:getAll'),
  addNightwaveChallenge: (input: NightwaveChallengeInput): Promise<NightwaveChallenge> =>
    ipcRenderer.invoke('nightwave:add', input),
  setNightwaveChallengeCompleted: (id: number, completed: boolean): Promise<NightwaveChallenge> =>
    ipcRenderer.invoke('nightwave:setCompleted', id, completed),
  deleteNightwaveChallenge: (id: number): Promise<void> => ipcRenderer.invoke('nightwave:delete', id),

  getRivenMods: (): Promise<RivenMod[]> => ipcRenderer.invoke('riven:getAll'),
  addRivenMod: (input: RivenModInput): Promise<RivenMod> => ipcRenderer.invoke('riven:add', input),
  updateRivenMod: (id: number, patch: RivenModPatch): Promise<RivenMod> =>
    ipcRenderer.invoke('riven:update', id, patch),
  deleteRivenMod: (id: number): Promise<void> => ipcRenderer.invoke('riven:delete', id),

  getCompanionStatuses: (): Promise<CompanionStatus[]> => ipcRenderer.invoke('companionStatus:getAll'),
  setDnaStability: (itemUniqueName: string, dnaStability: number | null): Promise<CompanionStatus> =>
    ipcRenderer.invoke('companionStatus:setDnaStability', itemUniqueName, dnaStability),

  getFocusSchools: (): Promise<FocusSchool[]> => ipcRenderer.invoke('focusSchool:getAll'),
  updateFocusSchool: (schoolName: string, patch: FocusSchoolPatch): Promise<FocusSchool> =>
    ipcRenderer.invoke('focusSchool:update', schoolName, patch),

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
