import { getDb } from './index'
import type { Locale, UserProfile, UserProfilePatch } from './types'

interface UserProfileRow {
  id: number
  mastery_rank: number
  credits: number
  platinum: number
  locale: Locale
  last_seen_changelog_version: string
  updated_at: string
}

function toUserProfile(row: UserProfileRow): UserProfile {
  return {
    masteryRank: row.mastery_rank,
    credits: row.credits,
    platinum: row.platinum,
    locale: row.locale,
    lastSeenChangelogVersion: row.last_seen_changelog_version,
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
    masteryRank: patch.masteryRank ?? existing.mastery_rank,
    credits: patch.credits ?? existing.credits,
    platinum: patch.platinum ?? existing.platinum,
    locale: patch.locale ?? existing.locale,
    lastSeenChangelogVersion: patch.lastSeenChangelogVersion ?? existing.last_seen_changelog_version
  }

  db.prepare(
    "UPDATE user_profile SET mastery_rank = @masteryRank, credits = @credits, platinum = @platinum, locale = @locale, last_seen_changelog_version = @lastSeenChangelogVersion, updated_at = datetime('now') WHERE id = 1"
  ).run(merged)

  const row = db.prepare('SELECT * FROM user_profile WHERE id = 1').get() as UserProfileRow
  return toUserProfile(row)
}
