import { useUserProfileStore } from '../store/useUserProfileStore'
import { translate } from './useT'
import type { TranslationKey } from './translations'

// Main process'da renderer'ning locale store'iga kirish yo'q, shuning uchun
// IPC orqali uloqtirilgan xatolar aniq kod bilan keladi (masalan
// "ERR_BACKUP_NOT_FOUND:tennolog.backup...db"). Bu yerda o'sha kodni joriy
// locale'ga mos matnga aylantiramiz - noma'lum kod/xabar bo'lsa xom holida
// ko'rsatamiz (masalan tarmoq yoki kutilmagan xatolar).
const ERROR_CODES: { pattern: RegExp; key: TranslationKey }[] = [
  { pattern: /ERR_BACKUP_NOT_FOUND:(.+)/, key: 'errors.backupNotFound' },
  { pattern: /ERR_FOCUS_SCHOOL_NOT_FOUND:(.+)/, key: 'errors.focusSchoolNotFound' },
  { pattern: /ERR_RIVEN_NOT_FOUND:(.+)/, key: 'errors.rivenNotFound' },
  { pattern: /ERR_WISHLIST_NOT_FOUND:(.+)/, key: 'errors.wishlistNotFound' },
  { pattern: /ERR_SHARE_CODE_INVALID/, key: 'errors.shareCodeInvalid' }
]

export function describeError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error)
  const locale = useUserProfileStore.getState().locale

  for (const { pattern, key } of ERROR_CODES) {
    const match = raw.match(pattern)
    if (match) return translate(locale, key, { value: match[1] ?? '' })
  }

  return raw
}
