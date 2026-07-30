import type Database from 'better-sqlite3'
import migration001 from './migrations/001_init.sql?raw'
import migration002 from './migrations/002_mission_status.sql?raw'
import migration003 from './migrations/003_nightwave.sql?raw'
import migration004 from './migrations/004_riven.sql?raw'
import migration005 from './migrations/005_companion_focus.sql?raw'
import migration006 from './migrations/006_user_profile.sql?raw'
import { createBackup } from './backup'

interface Migration {
  version: number
  sql: string
}

// TDD 4.2.1: raqamlangan migratsiya skriptlari, versiya bo'yicha ketma-ket qo'llanadi.
const migrations: Migration[] = [
  { version: 1, sql: migration001 },
  { version: 2, sql: migration002 },
  { version: 3, sql: migration003 },
  { version: 4, sql: migration004 },
  { version: 5, sql: migration005 },
  { version: 6, sql: migration006 }
]

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
    createBackup(db, dbPath)
  }

  for (const migration of pending) {
    const apply = db.transaction(() => {
      db.exec(migration.sql)
      setVersion(db, migration.version)
    })
    apply()
  }
}
