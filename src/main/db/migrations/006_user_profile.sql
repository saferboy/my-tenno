-- Foydalanuvchi profili - Mastery Rank kabi Warframe API bermaydigan
-- shaxsiy ma'lumotlar qo'lda kiritiladi. Bitta qatorli (singleton) jadval.
CREATE TABLE IF NOT EXISTS user_profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  mastery_rank INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO user_profile (id, mastery_rank)
SELECT 1, 0
WHERE NOT EXISTS (SELECT 1 FROM user_profile);
