import { getDb } from './index'
import type { UserProfile, UserProfilePatch } from './types'

interface UserProfileRow {
  id: number
  mastery_rank: number
  updated_at: string
}

function toUserProfile(row: UserProfileRow): UserProfile {
  return {
    masteryRank: row.mastery_rank,
    updatedAt: row.updated_at
  }
}

// Bitta qatorli (singleton, id=1) jadval - migratsiya orqali oldindan seed qilingan.
export function getUserProfile(): UserProfile {
  const db = getDb()
  const row = db.prepare('SELECT * FROM user_profile WHERE id = 1').get() as UserProfileRow
  return toUserProfile(row)
}

export function updateUserProfile(patch: UserProfilePatch): UserProfile {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM user_profile WHERE id = 1').get() as UserProfileRow

  const merged = {
    masteryRank: patch.masteryRank ?? existing.mastery_rank
  }

  db.prepare("UPDATE user_profile SET mastery_rank = @masteryRank, updated_at = datetime('now') WHERE id = 1").run(
    merged
  )

  const row = db.prepare('SELECT * FROM user_profile WHERE id = 1').get() as UserProfileRow
  return toUserProfile(row)
}
