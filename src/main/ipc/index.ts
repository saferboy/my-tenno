import { dialog, ipcMain, type IpcMainInvokeEvent } from 'electron'
import { writeFileSync } from 'fs'
import { closeDb, getDb, getDbPath } from '../db'
import { createBackup, listBackups, restoreBackup } from '../db/backup'
import { getAllItemStatuses, upsertItemStatus } from '../db/itemStatus'
import { getAllMissionStatuses, setMissionCompleted } from '../db/missionStatus'
import { getAllChallenges, addChallenge, setChallengeCompleted, deleteChallenge } from '../db/nightwaveChallenge'
import { getAllRivenMods, addRivenMod, updateRivenMod, deleteRivenMod } from '../db/rivenMod'
import { getAllCompanionStatuses, setDnaStability } from '../db/companionStatus'
import { getAllFocusSchools, updateFocusSchool } from '../db/focusSchool'
import type {
  ItemStatusPatch,
  NightwaveChallengeInput,
  RivenModInput,
  RivenModPatch,
  FocusSchoolPatch
} from '../db/types'
import { logError } from '../logger'
import { getMasterData } from '../masterData'
import { getNodes } from '../masterData/nodes'

// TDD 7.3: har bir handler xatoni lokal log fayliga yozadi, so'ng renderer
// promise'i rad etilishi (reject) uchun qayta uloqtiradi - "qotib qolish"
// o'rniga foydalanuvchi chiroyli xato ko'radi.
function handle(
  channel: string,
  listener: (event: IpcMainInvokeEvent, ...args: never[]) => unknown
): void {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      return await listener(event, ...(args as never[]))
    } catch (error) {
      logError(channel, error)
      throw error
    }
  })
}

// TDD 2.3: React'dan keladigan IPC so'rovlari faqat shu yerda, aniq
// kanallar orqali ushlanadi - preload orqali oldindan belgilangan
// metodlarga mos.
export function registerIpcHandlers(): void {
  handle('masterData:get', () => {
    return getMasterData()
  })

  handle('masterData:getNodes', () => {
    return getNodes()
  })

  handle('db:getSchemaVersion', () => {
    const db = getDb()
    const row = db.prepare('SELECT version FROM schema_version').get() as { version: number } | undefined
    return row?.version ?? 0
  })

  handle('itemStatus:getAll', () => {
    return getAllItemStatuses()
  })

  handle('itemStatus:update', (_event, itemUniqueName: string, patch: ItemStatusPatch) => {
    return upsertItemStatus(itemUniqueName, patch)
  })

  handle('missionStatus:getAll', () => {
    return getAllMissionStatuses()
  })

  handle('missionStatus:update', (_event, nodeUniqueName: string, completed: boolean) => {
    return setMissionCompleted(nodeUniqueName, completed)
  })

  // TDD 5.4: Nightwave & Daily/Weekly Tracker.
  handle('nightwave:getAll', () => {
    return getAllChallenges()
  })

  handle('nightwave:add', (_event, input: NightwaveChallengeInput) => {
    return addChallenge(input)
  })

  handle('nightwave:setCompleted', (_event, id: number, completed: boolean) => {
    return setChallengeCompleted(id, completed)
  })

  handle('nightwave:delete', (_event, id: number) => {
    deleteChallenge(id)
  })

  // TDD 5.5: Riven Mod Tracker.
  handle('riven:getAll', () => {
    return getAllRivenMods()
  })

  handle('riven:add', (_event, input: RivenModInput) => {
    return addRivenMod(input)
  })

  handle('riven:update', (_event, id: number, patch: RivenModPatch) => {
    return updateRivenMod(id, patch)
  })

  handle('riven:delete', (_event, id: number) => {
    deleteRivenMod(id)
  })

  // TDD 5.6: Companion & Focus Tracker.
  handle('companionStatus:getAll', () => {
    return getAllCompanionStatuses()
  })

  handle('companionStatus:setDnaStability', (_event, itemUniqueName: string, dnaStability: number | null) => {
    return setDnaStability(itemUniqueName, dnaStability)
  })

  handle('focusSchool:getAll', () => {
    return getAllFocusSchools()
  })

  handle('focusSchool:update', (_event, schoolName: string, patch: FocusSchoolPatch) => {
    return updateFocusSchool(schoolName, patch)
  })

  // TDD 7.2: Export Backup / Restore from Backup.
  handle('backup:create', () => {
    return createBackup(getDb(), getDbPath())
  })

  handle('backup:list', () => {
    return listBackups(getDbPath())
  })

  handle('backup:restore', (_event, fileName: string) => {
    closeDb()
    restoreBackup(getDbPath(), fileName)
    getDb()
  })

  handle('backup:exportJson', async () => {
    const db = getDb()
    const payload = {
      exportedAt: new Date().toISOString(),
      itemStatuses: db.prepare('SELECT * FROM item_status').all(),
      missionStatuses: db.prepare('SELECT * FROM mission_status').all(),
      nightwaveChallenges: db.prepare('SELECT * FROM nightwave_challenge').all(),
      rivenMods: db.prepare('SELECT * FROM riven_mod').all(),
      companionStatuses: db.prepare('SELECT * FROM companion_status').all(),
      focusSchools: db.prepare('SELECT * FROM focus_school').all()
    }

    const result = await dialog.showSaveDialog({
      defaultPath: 'tennolog-export.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })

    if (result.canceled || !result.filePath) {
      return { saved: false, filePath: null }
    }

    writeFileSync(result.filePath, JSON.stringify(payload, null, 2))
    return { saved: true, filePath: result.filePath }
  })
}
