-- Wishlist - foydalanuvchi umumiy katalogdan (Weapons/Warframes/Companion)
-- tanlab qo'shadigan "orzu qilingan" narsalar ro'yxati. riven_mod'ga
-- o'xshash pattern - master data'ga yumshoq (soft) bog'lanish.
CREATE TABLE IF NOT EXISTS wishlist_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_unique_name TEXT,
  item_name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
