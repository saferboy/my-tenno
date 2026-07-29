import { ipcMain } from 'electron'
import { getDb } from '../db'
import { getAllItemStatuses, upsertItemStatus } from '../db/itemStatus'
import type { ItemStatusPatch } from '../db/types'
import { getMasterData } from '../masterData'

// TDD 2.3: React'dan keladigan IPC so'rovlari faqat shu yerda, aniq
// kanallar orqali ushlanadi - preload orqali oldindan belgilangan
// metodlarga mos.
export function registerIpcHandlers(): void {
  ipcMain.handle('masterData:get', () => {
    return getMasterData()
  })

  ipcMain.handle('db:getSchemaVersion', () => {
    const db = getDb()
    const row = db.prepare('SELECT version FROM schema_version').get() as { version: number } | undefined
    return row?.version ?? 0
  })

  ipcMain.handle('itemStatus:getAll', () => {
    return getAllItemStatuses()
  })

  ipcMain.handle('itemStatus:update', (_event, itemUniqueName: string, patch: ItemStatusPatch) => {
    return upsertItemStatus(itemUniqueName, patch)
  })
}
