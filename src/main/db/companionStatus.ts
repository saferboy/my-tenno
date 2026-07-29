import { getDb } from './index'
import type { CompanionStatus } from './types'

interface CompanionStatusRow {
  item_unique_name: string
  dna_stability: number | null
  updated_at: string
}

function toCompanionStatus(row: CompanionStatusRow): CompanionStatus {
  return {
    itemUniqueName: row.item_unique_name,
    dnaStability: row.dna_stability,
    updatedAt: row.updated_at
  }
}

export function getAllCompanionStatuses(): CompanionStatus[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM companion_status').all() as CompanionStatusRow[]
  return rows.map(toCompanionStatus)
}

export function setDnaStability(itemUniqueName: string, dnaStability: number | null): CompanionStatus {
  const db = getDb()

  db.prepare(
    `INSERT INTO companion_status (item_unique_name, dna_stability, updated_at)
     VALUES (@itemUniqueName, @dnaStability, datetime('now'))
     ON CONFLICT(item_unique_name) DO UPDATE SET dna_stability = @dnaStability, updated_at = datetime('now')`
  ).run({ itemUniqueName, dnaStability })

  const row = db
    .prepare('SELECT * FROM companion_status WHERE item_unique_name = ?')
    .get(itemUniqueName) as CompanionStatusRow

  return toCompanionStatus(row)
}
