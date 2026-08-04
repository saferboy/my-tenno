import type { Locale } from '../../../main/db/types'

export interface ChangelogEntry {
  version: string
  highlights: Record<Locale, string[]>
}

// Har bir reliz uchun qo'lda yoziladi - eng yangisi ro'yxat boshida.
// WhatsNewModal joriy ilova versiyasiga mos yozuvni qidiradi va uni
// foydalanuvchi hali ko'rmagan bo'lsa ko'rsatadi (user_profile.last_seen_changelog_version).
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.5.2',
    highlights: {
      uz: [
        "Yangi: reliz chiqqanda shu \"Yangiliklar\" oynasi avtomatik ko'rsatiladi.",
        "O'zbekcha interfeysdagi bir qancha inglizcha qolib ketgan so'zlar (Owned, Maxed, Dashboard va h.k.) o'zbek tiliga to'g'irlandi."
      ],
      ru: [
        'Новое: при выходе релиза теперь автоматически показывается это окно "Что нового".',
        'Исправлены непереведённые английские слова в узбекской локализации.'
      ],
      en: [
        'New: this "What\'s New" popup now shows automatically after each release.',
        'Fixed several untranslated English strings in the Uzbek localization.'
      ]
    }
  }
]

export function getChangelogEntry(version: string): ChangelogEntry | undefined {
  return CHANGELOG.find((entry) => entry.version === version)
}
