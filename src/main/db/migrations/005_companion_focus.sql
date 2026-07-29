-- TDD 5.6: Companion & Focus Tracker.
-- companion_status - item_status'ga o'xshab item_unique_name orqali
-- Pets kategoriyasidagi master data'ga bog'lanadi, faqat companion'larga xos
-- DNA stability maydoni bilan.
CREATE TABLE IF NOT EXISTS companion_status (
  item_unique_name TEXT PRIMARY KEY,
  dna_stability INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Focus School'lar statik va barqaror (5 tasi) - shuning uchun bir marta
-- seed qilinadi, foydalanuvchi faqat rank/notes'ni yangilaydi.
CREATE TABLE IF NOT EXISTS focus_school (
  school_name TEXT PRIMARY KEY,
  rank INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO focus_school (school_name, rank, notes)
SELECT school_name, 0, NULL FROM (
  SELECT 'Zenurik' AS school_name
  UNION ALL SELECT 'Madurai'
  UNION ALL SELECT 'Naramon'
  UNION ALL SELECT 'Unairu'
  UNION ALL SELECT 'Vazarin'
)
WHERE NOT EXISTS (SELECT 1 FROM focus_school);
