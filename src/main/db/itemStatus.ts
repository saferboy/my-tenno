import { getDb } from './index'
import type { ItemStatus, ItemStatusPatch } from './types'

interface ItemStatusRow {
  item_unique_name: string
  owned: number
  maxed: number
  sold: number
  rank: number | null
  notes: string | null
  updated_at: string
}

function toItemStatus(row: ItemStatusRow): ItemStatus {
  return {
    itemUniqueName: row.item_unique_name,
    owned: Boolean(row.owned),
    maxed: Boolean(row.maxed),
    sold: Boolean(row.sold),
    rank: row.rank,
    notes: row.notes,
    updatedAt: row.updated_at
  }
}

export function getAllItemStatuses(): ItemStatus[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM item_status').all() as ItemStatusRow[]
  return rows.map(toItemStatus)
}

// TDD 5.2: Arsenal drawer'dan keladigan qisman (partial) yangilanishlarni
// mavjud qiymatlar bilan birlashtirib saqlaydi (owned/maxed/sold/rank/notes).
export function upsertItemStatus(itemUniqueName: string, patch: ItemStatusPatch): ItemStatus {
  const db = getDb()

  const apply = db.transaction(() => {
    const existing = db
      .prepare('SELECT * FROM item_status WHERE item_unique_name = ?')
      .get(itemUniqueName) as ItemStatusRow | undefined

    const merged = {
      owned: patch.owned ?? (existing ? Boolean(existing.owned) : false),
      maxed: patch.maxed ?? (existing ? Boolean(existing.maxed) : false),
      sold: patch.sold ?? (existing ? Boolean(existing.sold) : false),
      rank: patch.rank !== undefined ? patch.rank : (existing?.rank ?? null),
      notes: patch.notes !== undefined ? patch.notes : (existing?.notes ?? null)
    }

    db.prepare(
      `INSERT INTO item_status (item_unique_name, owned, maxed, sold, rank, notes, updated_at)
       VALUES (@itemUniqueName, @owned, @maxed, @sold, @rank, @notes, datetime('now'))
       ON CONFLICT(item_unique_name) DO UPDATE SET
         owned = @owned, maxed = @maxed, sold = @sold, rank = @rank, notes = @notes, updated_at = datetime('now')`
    ).run({
      itemUniqueName,
      owned: merged.owned ? 1 : 0,
      maxed: merged.maxed ? 1 : 0,
      sold: merged.sold ? 1 : 0,
      rank: merged.rank,
      notes: merged.notes
    })

    return db.prepare('SELECT * FROM item_status WHERE item_unique_name = ?').get(itemUniqueName) as ItemStatusRow
  })

  return toItemStatus(apply())
}
