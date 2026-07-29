import { getDb } from './index'
import type { FocusSchool, FocusSchoolPatch } from './types'

interface FocusSchoolRow {
  school_name: string
  rank: number
  notes: string | null
  updated_at: string
}

function toFocusSchool(row: FocusSchoolRow): FocusSchool {
  return {
    schoolName: row.school_name,
    rank: row.rank,
    notes: row.notes,
    updatedAt: row.updated_at
  }
}

export function getAllFocusSchools(): FocusSchool[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM focus_school ORDER BY school_name').all() as FocusSchoolRow[]
  return rows.map(toFocusSchool)
}

export function updateFocusSchool(schoolName: string, patch: FocusSchoolPatch): FocusSchool {
  const db = getDb()
  const existing = db
    .prepare('SELECT * FROM focus_school WHERE school_name = ?')
    .get(schoolName) as FocusSchoolRow | undefined

  if (!existing) {
    throw new Error(`Focus School topilmadi: ${schoolName}`)
  }

  const merged = {
    schoolName,
    rank: patch.rank ?? existing.rank,
    notes: patch.notes !== undefined ? patch.notes : existing.notes
  }

  db.prepare(
    "UPDATE focus_school SET rank = @rank, notes = @notes, updated_at = datetime('now') WHERE school_name = @schoolName"
  ).run(merged)

  const row = db.prepare('SELECT * FROM focus_school WHERE school_name = ?').get(schoolName) as FocusSchoolRow
  return toFocusSchool(row)
}
