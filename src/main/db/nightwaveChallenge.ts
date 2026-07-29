import { getDb } from './index'
import type { NightwaveChallenge, NightwaveChallengeInput } from './types'

interface NightwaveChallengeRow {
  id: number
  title: string
  type: string
  completed: number
  created_at: string
  updated_at: string
}

function toChallenge(row: NightwaveChallengeRow): NightwaveChallenge {
  return {
    id: row.id,
    title: row.title,
    type: row.type as NightwaveChallenge['type'],
    completed: Boolean(row.completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export function getAllChallenges(): NightwaveChallenge[] {
  const db = getDb()
  const rows = db
    .prepare('SELECT * FROM nightwave_challenge ORDER BY type, created_at')
    .all() as NightwaveChallengeRow[]
  return rows.map(toChallenge)
}

export function addChallenge(input: NightwaveChallengeInput): NightwaveChallenge {
  const db = getDb()
  const result = db
    .prepare('INSERT INTO nightwave_challenge (title, type) VALUES (@title, @type)')
    .run(input)
  const row = db
    .prepare('SELECT * FROM nightwave_challenge WHERE id = ?')
    .get(result.lastInsertRowid) as NightwaveChallengeRow
  return toChallenge(row)
}

export function setChallengeCompleted(id: number, completed: boolean): NightwaveChallenge {
  const db = getDb()
  db.prepare("UPDATE nightwave_challenge SET completed = ?, updated_at = datetime('now') WHERE id = ?").run(
    completed ? 1 : 0,
    id
  )
  const row = db.prepare('SELECT * FROM nightwave_challenge WHERE id = ?').get(id) as NightwaveChallengeRow
  return toChallenge(row)
}

export function deleteChallenge(id: number): void {
  const db = getDb()
  db.prepare('DELETE FROM nightwave_challenge WHERE id = ?').run(id)
}
