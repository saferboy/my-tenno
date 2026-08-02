import { getDb } from './index'
import type { RivenMod, RivenModInput, RivenModPatch } from './types'

interface RivenModRow {
  id: number
  weapon_unique_name: string | null
  weapon_name: string
  stats: string | null
  reroll_count: number
  target_notes: string | null
  mastered: number
  created_at: string
  updated_at: string
}

function toRivenMod(row: RivenModRow): RivenMod {
  return {
    id: row.id,
    weaponUniqueName: row.weapon_unique_name,
    weaponName: row.weapon_name,
    stats: row.stats ? (JSON.parse(row.stats) as string[]) : [],
    rerollCount: row.reroll_count,
    targetNotes: row.target_notes,
    mastered: Boolean(row.mastered),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export function getAllRivenMods(): RivenMod[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM riven_mod ORDER BY created_at DESC').all() as RivenModRow[]
  return rows.map(toRivenMod)
}

export function addRivenMod(input: RivenModInput): RivenMod {
  const db = getDb()
  const result = db
    .prepare(
      `INSERT INTO riven_mod (weapon_unique_name, weapon_name, stats, target_notes)
       VALUES (@weaponUniqueName, @weaponName, @stats, @targetNotes)`
    )
    .run({
      weaponUniqueName: input.weaponUniqueName,
      weaponName: input.weaponName,
      stats: JSON.stringify(input.stats),
      targetNotes: input.targetNotes
    })

  const row = db.prepare('SELECT * FROM riven_mod WHERE id = ?').get(result.lastInsertRowid) as RivenModRow
  return toRivenMod(row)
}

// TDD 5.5: qisman yangilanish - masalan faqat reroll_count'ni oshirish yoki
// "mastered" belgisini o'zgartirish, boshqa maydonlarni saqlab qolgan holda.
export function updateRivenMod(id: number, patch: RivenModPatch): RivenMod {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM riven_mod WHERE id = ?').get(id) as RivenModRow | undefined
  if (!existing) {
    throw new Error(`ERR_RIVEN_NOT_FOUND:${id}`)
  }

  const merged = {
    id,
    stats: patch.stats !== undefined ? JSON.stringify(patch.stats) : existing.stats,
    rerollCount: patch.rerollCount ?? existing.reroll_count,
    targetNotes: patch.targetNotes !== undefined ? patch.targetNotes : existing.target_notes,
    mastered: patch.mastered !== undefined ? (patch.mastered ? 1 : 0) : existing.mastered
  }

  db.prepare(
    `UPDATE riven_mod SET stats = @stats, reroll_count = @rerollCount, target_notes = @targetNotes,
     mastered = @mastered, updated_at = datetime('now') WHERE id = @id`
  ).run(merged)

  const row = db.prepare('SELECT * FROM riven_mod WHERE id = ?').get(id) as RivenModRow
  return toRivenMod(row)
}

export function deleteRivenMod(id: number): void {
  const db = getDb()
  db.prepare('DELETE FROM riven_mod WHERE id = ?').run(id)
}
