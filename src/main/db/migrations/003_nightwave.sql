-- TDD 5.4: Nightwave & Daily/Weekly Tracker - foydalanuvchi qo'lda qo'shadigan
-- challenge'lar (real vaqtdagi Nightwave mavsumi uchun rasmiy API mavjud emas).
CREATE TABLE IF NOT EXISTS nightwave_challenge (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'season')),
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
