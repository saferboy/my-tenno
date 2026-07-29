import { ipcMain } from 'electron'
import { getDb } from '../db'
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
}
