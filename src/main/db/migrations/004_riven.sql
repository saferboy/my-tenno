-- TDD 5.5: Riven Mod Tracker - riven'lar user-generated ma'lumot, master
-- data'ga bog'lanishi ixtiyoriy (weapon_unique_name orqali dispozitsiya
-- ko'rsatish uchun).
CREATE TABLE IF NOT EXISTS riven_mod (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  weapon_unique_name TEXT,
  weapon_name TEXT NOT NULL,
  stats TEXT,
  reroll_count INTEGER NOT NULL DEFAULT 0,
  target_notes TEXT,
  mastered INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
