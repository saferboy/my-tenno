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
  FocusSchoolPatch,
  UserProfile,
  UserProfilePatch,
  QuestStatus,
  WishlistItem,
  WishlistItemInput,
  WishlistItemPatch
} from '../main/db/types'
import type { BackupInfo } from '../main/db/backup'
import type { SharePayload } from '../main/shareCode'
import type { UpdaterEvent } from '../main/updater'

// TDD 7.1: faqat oldindan belgilangan, cheklangan metodlar ochiladi - to'liq
// ipcRenderer obyekti hech qachon renderer'ga uzatilmaydi.
const api = {
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
  getMasterData: (): Promise<MasterDataPayload> => ipcRenderer.invoke('masterData:get'),
  getSchemaVersion: (): Promise<number> => ipcRenderer.invoke('db:getSchemaVersion'),
  getItemStatuses: (): Promise<ItemStatus[]> => ipcRenderer.invoke('itemStatus:getAll'),
  updateItemStatus: (itemUniqueName: string, patch: ItemStatusPatch): Promise<ItemStatus> =>
    ipcRenderer.invoke('itemStatus:update', itemUniqueName, patch),

  getNodes: (): Promise<MissionNode[]> => ipcRenderer.invoke('masterData:getNodes'),
  getItemImage: (uniqueName: string, imageName: string | undefined): Promise<string | null> =>
    ipcRenderer.invoke('masterData:getItemImage', uniqueName, imageName),
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

  getWishlistItems: (): Promise<WishlistItem[]> => ipcRenderer.invoke('wishlist:getAll'),
  addWishlistItem: (input: WishlistItemInput): Promise<WishlistItem> => ipcRenderer.invoke('wishlist:add', input),
  updateWishlistItem: (id: number, patch: WishlistItemPatch): Promise<WishlistItem> =>
    ipcRenderer.invoke('wishlist:update', id, patch),
  deleteWishlistItem: (id: number): Promise<void> => ipcRenderer.invoke('wishlist:delete', id),

  getQuestStatuses: (): Promise<QuestStatus[]> => ipcRenderer.invoke('questStatus:getAll'),
  updateQuestStatus: (questUniqueName: string, completed: boolean): Promise<QuestStatus> =>
    ipcRenderer.invoke('questStatus:update', questUniqueName, completed),

  getUserProfile: (): Promise<UserProfile> => ipcRenderer.invoke('userProfile:get'),
  updateUserProfile: (patch: UserProfilePatch): Promise<UserProfile> =>
    ipcRenderer.invoke('userProfile:update', patch),

  toggleOverlay: (): Promise<boolean> => ipcRenderer.invoke('overlay:toggle'),

  // TDD 7.1: to'liq ipcRenderer o'rniga faqat "updater:event" kanaliga xos,
  // cheklangan obuna funksiyasi ochiladi.
  onUpdaterEvent: (callback: (event: UpdaterEvent) => void): (() => void) => {
    const listener = (_event: unknown, data: UpdaterEvent): void => callback(data)
    ipcRenderer.on('updater:event', listener)
    return () => ipcRenderer.removeListener('updater:event', listener)
  },
  downloadUpdate: (): Promise<void> => ipcRenderer.invoke('updater:download'),
  installUpdate: (): Promise<void> => ipcRenderer.invoke('updater:install'),

  generateShareCode: (): Promise<string> => ipcRenderer.invoke('shareCode:generate'),
  parseShareCode: (code: string): Promise<SharePayload> => ipcRenderer.invoke('shareCode:parse', code),

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
