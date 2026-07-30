import { getDb } from './index'
import type { QuestStatus } from './types'

interface QuestStatusRow {
  quest_unique_name: string
  completed: number
  updated_at: string
}

function toQuestStatus(row: QuestStatusRow): QuestStatus {
  return {
    questUniqueName: row.quest_unique_name,
    completed: Boolean(row.completed),
    updatedAt: row.updated_at
  }
}

export function getAllQuestStatuses(): QuestStatus[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM quest_status').all() as QuestStatusRow[]
  return rows.map(toQuestStatus)
}

export function setQuestCompleted(questUniqueName: string, completed: boolean): QuestStatus {
  const db = getDb()

  db.prepare(
    `INSERT INTO quest_status (quest_unique_name, completed, updated_at)
     VALUES (@questUniqueName, @completed, datetime('now'))
     ON CONFLICT(quest_unique_name) DO UPDATE SET completed = @completed, updated_at = datetime('now')`
  ).run({ questUniqueName, completed: completed ? 1 : 0 })

  const row = db.prepare('SELECT * FROM quest_status WHERE quest_unique_name = ?').get(questUniqueName) as QuestStatusRow

  return toQuestStatus(row)
}
