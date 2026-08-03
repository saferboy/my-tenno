-- Credits/Platinum - Warframe API bermaydigan resurslar, Mastery Rank kabi
-- qo'lda kiritiladi (user_profile singleton jadvaliga qo'shimcha ustunlar).
ALTER TABLE user_profile ADD COLUMN credits INTEGER NOT NULL DEFAULT 0;
ALTER TABLE user_profile ADD COLUMN platinum INTEGER NOT NULL DEFAULT 0;
