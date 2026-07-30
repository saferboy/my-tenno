-- Quest Timeline - kvest bajarilganlik holati (mission_status bilan bir xil pattern).
CREATE TABLE IF NOT EXISTS quest_status (
  quest_unique_name TEXT PRIMARY KEY,
  completed INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
