-- TDD 4.2.1: schema_version jadvali - joriy migratsiya versiyasini kuzatish uchun.
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER NOT NULL
);

-- TDD 5.2: Arsenal uchun foydalanuvchi progressi (qurol/frame status).
CREATE TABLE IF NOT EXISTS item_status (
  item_unique_name TEXT PRIMARY KEY,
  owned INTEGER NOT NULL DEFAULT 0,
  maxed INTEGER NOT NULL DEFAULT 0,
  sold INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  notes TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Umumiy kalit-qiymat sozlamalari (masalan, oxirgi ko'rilgan warframe-items dataVersion).
CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT
);
