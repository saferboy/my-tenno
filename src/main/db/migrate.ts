import type Database from 'better-sqlite3'
import { existsSync, copyFileSync, readdirSync, unlinkSync, statSync } from 'fs'
import { join, dirname } from 'path'
import migration001 from './migrations/001_init.sql?raw'

interface Migration {
  version: number
  sql: string
}

// TDD 4.2.1: raqamlangan migratsiya skriptlari, versiya bo'yicha ketma-ket qo'llanadi.
const migrations: Migration[] = [{ version: 1, sql: migration001 }]

// TDD 4.2.2: backup rotatsiyasi - oxirgi 5 tasi saqlanadi.
const MAX_BACKUPS = 5

function backupDatabase(dbPath: string): void {
  if (!existsSync(dbPath)) return

  const dir = dirname(dbPath)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = join(dir, `tennolog.backup.${timestamp}.db`)
  copyFileSync(dbPath, backupPath)

  const backups = readdirSync(dir)
    .filter((f) => f.startsWith('tennolog.backup.') && f.endsWith('.db'))
    .map((f) => ({ path: join(dir, f), mtime: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)

  for (const stale of backups.slice(MAX_BACKUPS)) {
    unlinkSync(stale.path)
  }
}

function getCurrentVersion(db: Database.Database): number {
  const tableExists = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'schema_version'")
    .get()
  if (!tableExists) return 0

  const row = db.prepare('SELECT version FROM schema_version').get() as { version: number } | undefined
  return row?.version ?? 0
}

function setVersion(db: Database.Database, version: number): void {
  const count = (db.prepare('SELECT COUNT(*) as count FROM schema_version').get() as { count: number }).count
  if (count === 0) {
    db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(version)
  } else {
    db.prepare('UPDATE schema_version SET version = ?').run(version)
  }
}

// TDD 4.2.1: migratsiyadan oldin avtomatik backup, muvaffaqiyatsizlikda tranzaksiya rollback qiladi.
export function runMigrations(db: Database.Database, dbPath: string): void {
  const currentVersion = getCurrentVersion(db)
  const pending = migrations.filter((m) => m.version > currentVersion).sort((a, b) => a.version - b.version)

  if (pending.length === 0) return

  if (currentVersion > 0) {
    backupDatabase(dbPath)
  }

  for (const migration of pending) {
    const apply = db.transaction(() => {
      db.exec(migration.sql)
      setVersion(db, migration.version)
    })
    apply()
  }
}
