import Database from 'better-sqlite3'
import { app } from 'electron'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { runMigrations } from './migrate'

let db: Database.Database | null = null

// TDD 4.2: User Data - tennolog.db, AppData/Roaming/TennoLog/ ichida.
export function getDb(): Database.Database {
  if (db) return db

  const userDataDir = app.getPath('userData')
  if (!existsSync(userDataDir)) {
    mkdirSync(userDataDir, { recursive: true })
  }

  const dbPath = join(userDataDir, 'tennolog.db')
  const instance = new Database(dbPath)
  instance.pragma('journal_mode = WAL')
  instance.pragma('foreign_keys = ON')

  runMigrations(instance, dbPath)

  db = instance
  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
