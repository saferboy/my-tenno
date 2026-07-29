import { dialog, ipcMain, type IpcMainInvokeEvent } from 'electron'
import { writeFileSync } from 'fs'
import { closeDb, getDb, getDbPath } from '../db'
import { createBackup, listBackups, restoreBackup } from '../db/backup'
import { getAllItemStatuses, upsertItemStatus } from '../db/itemStatus'
import { getAllMissionStatuses, setMissionCompleted } from '../db/missionStatus'
import type { ItemStatusPatch } from '../db/types'
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
      missionStatuses: db.prepare('SELECT * FROM mission_status').all()
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
