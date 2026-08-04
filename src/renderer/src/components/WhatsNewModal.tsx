import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useUserProfileStore } from '../store/useUserProfileStore'
import { useT } from '../i18n/useT'
import { getChangelogEntry } from '../data/changelog'

// Reliz chiqqanda bir martalik "Yangiliklar" oynasi - Warframe'ning o'zidagi
// update popup'iga o'xshab, xira kosmik fon + katta shaffof watermark matn
// bilan. Ko'rilgan versiya user_profile.last_seen_changelog_version'ga
// yoziladi - shu versiya uchun qayta chiqmaydi.
function WhatsNewModal(): React.JSX.Element | null {
  const [appVersion, setAppVersion] = useState<string | null>(null)
  const loading = useUserProfileStore((s) => s.loading)
  const lastSeen = useUserProfileStore((s) => s.lastSeenChangelogVersion)
  const locale = useUserProfileStore((s) => s.locale)
  const setLastSeenChangelogVersion = useUserProfileStore((s) => s.setLastSeenChangelogVersion)
  const t = useT()

  useEffect(() => {
    window.api.getAppVersion().then(setAppVersion)
  }, [])

  const entry = appVersion ? getChangelogEntry(appVersion) : undefined
  const visible = !loading && !!entry && lastSeen !== appVersion

  function handleClose(): void {
    if (appVersion) setLastSeenChangelogVersion(appVersion)
  }

  return createPortal(
    <AnimatePresence>
      {visible && entry && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              className="clip-corner border-glow glow-cyan glass-panel relative w-full max-w-md overflow-hidden rounded-lg border border-[var(--color-void-border)] shadow-2xl"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Xira kosmik fon + panjara - Star Chart markaziy xaritasidagi retsept. */}
              <div className="whatsnew-bg pointer-events-none absolute inset-0" />
              <div className="scanlines pointer-events-none absolute inset-0 opacity-30" />
              {/* Katta shaffof watermark matn - o'yindagi fon dekoratsiyasiga o'xshab. */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none">
                <span className="font-display -rotate-6 text-[110px] font-bold tracking-widest text-[var(--color-tenno-cyan)]/[0.07] uppercase">
                  TENNO
                </span>
              </div>

              <div className="relative flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-bold tracking-widest text-[var(--color-tenno-gold)]">
                      {t('whatsNew.title')}
                    </h2>
                    <p className="font-mono text-xs tracking-widest text-[var(--color-tenno-cyan)]">
                      {t('whatsNew.version', { version: entry.version })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-[var(--color-t2)] hover:text-[var(--color-t1)]"
                  >
                    ✕
                  </button>
                </div>

                <ul className="flex flex-col gap-2.5">
                  {entry.highlights[locale].map((line, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-[var(--color-t1)]">
                      <span className="mt-1 text-[var(--color-tenno-cyan)]">◆</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={handleClose}
                  className="hover-glow border-glow t self-end rounded-md px-4 py-2 font-display text-sm font-semibold tracking-wide text-[var(--color-tenno-gold)] uppercase"
                >
                  {t('whatsNew.gotIt')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default WhatsNewModal
