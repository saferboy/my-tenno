import { useUserProfileStore } from '../store/useUserProfileStore'
import { translations, type TranslationKey } from './translations'
import type { Locale } from '../../../main/db/types'

type Vars = Record<string, string | number>

export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match))
}

// Zustand store'dan (React komponent tashqarisida - masalan store action'lari
// yoki class komponentlar ichida) tarjima kerak bo'lganda ishlatiladi, useT()
// hook'i esa faqat function komponent render vaqtida chaqirilishi mumkin.
export function translate(locale: Locale, key: TranslationKey, vars?: Vars): string {
  return interpolate(translations[locale][key], vars)
}

export function useT(): (key: TranslationKey, vars?: Vars) => string {
  const locale = useUserProfileStore((s) => s.locale)
  return (key, vars) => translate(locale, key, vars)
}
