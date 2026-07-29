-- TDD 5.3: Mission Tracker - star chart node'lari bo'yicha bajarilganlik holati.
CREATE TABLE IF NOT EXISTS mission_status (
  node_unique_name TEXT PRIMARY KEY,
  completed INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
