import { useEffect } from 'react'
import { useNightwaveStore } from './store/useNightwaveStore'
import { useUserProfileStore } from './store/useUserProfileStore'
import { useT } from './i18n/useT'

// TDD 5.7: Mini Overlay - bugungi bajarilmagan Daily/Weekly vazifalar ro'yxati.
// Alohida BrowserWindow (o'z JS konteksti) bo'lgani uchun profil (locale)
// App.tsx'dagi kabi qayta yuklanishi kerak - aks holda useT() doim default
// 'uz' bilan qoladi.
function Overlay(): React.JSX.Element {
  const challenges = useNightwaveStore((s) => s.challenges)
  const init = useNightwaveStore((s) => s.init)
  const initProfile = useUserProfileStore((s) => s.init)
  const t = useT()

  useEffect(() => {
    init()
    initProfile()
  }, [init, initProfile])

  const undone = challenges.filter((c) => !c.completed && (c.type === 'daily' || c.type === 'weekly'))

  return (
    <div className="m-2 flex flex-col gap-1 rounded-lg border border-[var(--color-void-border)] bg-[var(--color-void-base)]/90 p-3 text-xs text-[var(--color-t1)]">
      <p className="mb-1 font-display font-bold tracking-wide text-[var(--color-tenno-gold)] uppercase">
        {t('overlay.title')}
      </p>
      {undone.length === 0 && <p className="text-[var(--color-t2)]">{t('overlay.allDone')}</p>}
      <ul className="space-y-0.5">
        {undone.map((challenge) => (
          <li key={challenge.id}>• {challenge.title}</li>
        ))}
      </ul>
    </div>
  )
}

export default Overlay
