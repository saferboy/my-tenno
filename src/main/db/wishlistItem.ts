import { getDb } from './index'
import type { WishlistItem, WishlistItemInput, WishlistItemPatch } from './types'

interface WishlistItemRow {
  id: number
  item_unique_name: string | null
  item_name: string
  notes: string | null
  created_at: string
  updated_at: string
}

function toWishlistItem(row: WishlistItemRow): WishlistItem {
  return {
    id: row.id,
    itemUniqueName: row.item_unique_name,
    itemName: row.item_name,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export function getAllWishlistItems(): WishlistItem[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM wishlist_item ORDER BY created_at DESC').all() as WishlistItemRow[]
  return rows.map(toWishlistItem)
}

export function addWishlistItem(input: WishlistItemInput): WishlistItem {
  const db = getDb()
  const result = db
    .prepare(
      `INSERT INTO wishlist_item (item_unique_name, item_name, notes)
       VALUES (@itemUniqueName, @itemName, @notes)`
    )
    .run({
      itemUniqueName: input.itemUniqueName,
      itemName: input.itemName,
      notes: input.notes
    })

  const row = db.prepare('SELECT * FROM wishlist_item WHERE id = ?').get(result.lastInsertRowid) as WishlistItemRow
  return toWishlistItem(row)
}

export function updateWishlistItem(id: number, patch: WishlistItemPatch): WishlistItem {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM wishlist_item WHERE id = ?').get(id) as WishlistItemRow | undefined
  if (!existing) {
    throw new Error(`Wishlist band topilmadi: ${id}`)
  }

  const merged = {
    id,
    notes: patch.notes !== undefined ? patch.notes : existing.notes
  }

  db.prepare("UPDATE wishlist_item SET notes = @notes, updated_at = datetime('now') WHERE id = @id").run(merged)

  const row = db.prepare('SELECT * FROM wishlist_item WHERE id = ?').get(id) as WishlistItemRow
  return toWishlistItem(row)
}

export function deleteWishlistItem(id: number): void {
  const db = getDb()
  db.prepare('DELETE FROM wishlist_item WHERE id = ?').run(id)
}
