-- Interfeys tili - foydalanuvchi profilining bir qismi (Mastery Rank kabi
-- singleton qatorda saqlanadi), 3 til qo'llab-quvvatlanadi: uz/ru/en.
ALTER TABLE user_profile ADD COLUMN locale TEXT NOT NULL DEFAULT 'uz';
