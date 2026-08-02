import type Database from 'better-sqlite3'
import { existsSync, copyFileSync, readdirSync, unlinkSync, statSync } from 'fs'
import { join, dirname } from 'path'

export interface BackupInfo {
  fileName: string
  createdAt: number
}

// TDD 4.2.2: backup rotatsiyasi - oxirgi 5 tasi saqlanadi.
const MAX_BACKUPS = 5

function listBackupFiles(dir: string): BackupInfo[] {
  if (!existsSync(dir)) return []

  return readdirSync(dir)
    .filter((f) => f.startsWith('tennolog.backup.') && f.endsWith('.db'))
    .map((f) => ({ fileName: f, createdAt: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.createdAt - a.createdAt)
}

function pruneBackups(dir: string): void {
  const backups = listBackupFiles(dir)
  for (const stale of backups.slice(MAX_BACKUPS)) {
    unlinkSync(join(dir, stale.fileName))
  }
}

function copyDbFile(dbPath: string): BackupInfo {
  const dir = dirname(dbPath)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `tennolog.backup.${timestamp}.db`
  copyFileSync(dbPath, join(dir, fileName))
  pruneBackups(dir)

  return { fileName, createdAt: statSync(join(dir, fileName)).mtimeMs }
}

// `db` ochiq ulanish bo'lgani uchun WAL faylidagi hali checkpoint qilinmagan
// yozuvlar bo'lishi mumkin - oddiy fayl nusxalash ularni backup'ga
// tushirmaydi. Nusxalashdan oldin WAL'ni asosiy faylga majburan qo'shamiz.
export function createBackup(db: Database.Database, dbPath: string): BackupInfo | null {
  if (!existsSync(dbPath)) return null

  db.pragma('wal_checkpoint(TRUNCATE)')
  return copyDbFile(dbPath)
}

export function listBackups(dbPath: string): BackupInfo[] {
  return listBackupFiles(dirname(dbPath))
}

// TDD 7.2: "Restore from Backup" - tanlangan backup joriy bazani almashtiradi.
// Qaytarib bo'lmaydigan holatga tushib qolmaslik uchun almashtirishdan oldin
// joriy holatning ham backup'i olinadi. Chaqiruvchi bazani oldindan yopgan
// bo'lishi kerak (yopilish WAL'ni avtomatik checkpoint qiladi), shuning uchun
// bu yerda oddiy fayl nusxalash yetarli.
export function restoreBackup(dbPath: string, fileName: string): void {
  const dir = dirname(dbPath)
  const backupPath = join(dir, fileName)
  if (!existsSync(backupPath)) {
    throw new Error(`ERR_BACKUP_NOT_FOUND:${fileName}`)
  }

  copyDbFile(dbPath)
  copyFileSync(backupPath, dbPath)

  for (const ext of ['-wal', '-shm']) {
    const sidecar = dbPath + ext
    if (existsSync(sidecar)) unlinkSync(sidecar)
  }
}
