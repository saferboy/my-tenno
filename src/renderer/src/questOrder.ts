// Kvestlarning o'yin-ichi xronologik (voqealar) tartibi - `warframe-items`
// paketida bunday maydon mavjud emas (faqat nom/tavsif bor), shuning uchun
// bu ro'yxat qo'lda tuzilgan: wiki.warframe.com'ning rasmiy "Quest
// Progression" ketma-ketligi + qo'shimcha manbalar (chiqarilish sanalari)
// asosida. Asosiy zanjir (Vor's Prize -> ... -> The New War -> ...)
// yuqori ishonchli; ba'zi yon-kvestlar (masalan Clan Key - bu haqiqatda
// hikoya kvesti emas, klan kaliti) aniq joyi yo'qligi sababli ro'yxat
// oxiriga qo'yilgan. Agar xato topsangiz - shu ro'yxatni tahrirlash kifoya.
export const QUEST_ORDER: string[] = [
  'Awakening',
  "Vor's Prize",
  'Patient Zero',
  'Howl Of The Kubrow',
  "Saya's Vigil",
  'Vox Solaris',
  'The Waverider',
  'Once Awake',
  'Heart Of Deimos',
  'The Archwing',
  'Stolen Dreams',
  'Hidden Messages',
  'The New Strange',
  'The Limbo Theorem',
  'The Jordas Precept',
  'Sands Of Inaros',
  'Mutalist Alad V Assassinate',
  'A Man Of Few Words',
  'Natah',
  'The Second Dream',
  "Octavia's Anthem",
  'The Silver Grove',
  'Rising Tide',
  'The War Within',
  'Mask Of The Revenant',
  'Chains Of Harrow',
  'Apostasy Prologue',
  'The Sacrifice',
  'The Glast Gambit',
  'The Deadlock Protocol',
  'Chimera Prologue',
  'Erra',
  'The New War',
  'Call Of The Tempestarii',
  'Angels Of The Zariman',
  'Veilbreaker',
  'The Duviri Paradox',
  'Whispers In The Walls',
  'Jade Shadows',
  'The Lotus Eaters',
  'The Hex',
  'The Hex Finale',
  'Clan Key'
]

export function questOrderIndex(name: string): number {
  const index = QUEST_ORDER.indexOf(name)
  return index === -1 ? QUEST_ORDER.length : index
}
