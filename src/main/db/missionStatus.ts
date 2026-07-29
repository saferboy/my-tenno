import { getDb } from './index'
import type { MissionStatus } from './types'

interface MissionStatusRow {
  node_unique_name: string
  completed: number
  updated_at: string
}

function toMissionStatus(row: MissionStatusRow): MissionStatus {
  return {
    nodeUniqueName: row.node_unique_name,
    completed: Boolean(row.completed),
    updatedAt: row.updated_at
  }
}

export function getAllMissionStatuses(): MissionStatus[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM mission_status').all() as MissionStatusRow[]
  return rows.map(toMissionStatus)
}

export function setMissionCompleted(nodeUniqueName: string, completed: boolean): MissionStatus {
  const db = getDb()

  db.prepare(
    `INSERT INTO mission_status (node_unique_name, completed, updated_at)
     VALUES (@nodeUniqueName, @completed, datetime('now'))
     ON CONFLICT(node_unique_name) DO UPDATE SET completed = @completed, updated_at = datetime('now')`
  ).run({ nodeUniqueName, completed: completed ? 1 : 0 })

  const row = db
    .prepare('SELECT * FROM mission_status WHERE node_unique_name = ?')
    .get(nodeUniqueName) as MissionStatusRow

  return toMissionStatus(row)
}
