-- "Yangiliklar" popup uchun - oxirgi ko'rilgan versiya user_profile
-- singleton jadvalida saqlanadi, ilova yangi versiyada ochilganda solishtiriladi.
ALTER TABLE user_profile ADD COLUMN last_seen_changelog_version TEXT NOT NULL DEFAULT '';
