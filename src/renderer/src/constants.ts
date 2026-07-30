// TDD 5.1/5.5: "Max qilingan qurollar" statistikasi va Riven Tracker'ning
// qurol tanlovi shu kategoriyalar bo'yicha aniqlanadi (Riven mod
// qo'llanadigan haqiqiy qurollar - Sentinels shu ro'yxatda emas, chunki
// Sentinel birligining o'zi riven statistikasiga ega emas).
export const WEAPON_CATEGORIES = new Set([
  'Primary',
  'Secondary',
  'Melee',
  'Archwing',
  'Arch-Gun',
  'Arch-Melee',
  'SentinelWeapons'
])

// Weapons sahifasi uchun kengroq qamrov - Sentinel birligi ham shu yerga
// kiradi (jihoz sifatida ekvivalent, lekin riven qo'llanmaydi).
export const WEAPONS_PAGE_CATEGORIES = new Set([...WEAPON_CATEGORIES, 'Sentinels'])

export const WARFRAME_CATEGORIES = new Set(['Warframes'])
