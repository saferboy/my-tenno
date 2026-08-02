import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNightwaveStore } from '../store/useNightwaveStore'
import ResetCountdown from '../components/ResetCountdown'
import { useT } from '../i18n/useT'
import type { TranslationKey } from '../i18n/translations'
import type { NightwaveChallengeType } from '../../../main/db/types'

function getNextUtcMidnight(): number {
  const now = new Date()
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
}

// Warframe'da haftalik reset dushanba UTC 00:00'da bo'ladi.
function getNextWeeklyReset(): number {
  const now = new Date()
  const day = now.getUTCDay()
  const diff = (1 - day + 7) % 7
  const daysUntilMonday = diff === 0 ? 7 : diff
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday, 0, 0, 0)
}

const TYPE_LABEL_KEYS: Record<NightwaveChallengeType, TranslationKey> = {
  daily: 'nightwave.type.daily',
  weekly: 'nightwave.type.weekly',
  season: 'nightwave.type.season'
}

// TDD 5.4: Nightwave uchun rasmiy jonli API yo'q, shuning uchun challenge'lar
// qo'lda qo'shiladi/belgilanadi; reset countdown'lar esa hisoblanadi.
function NightwaveTracker(): React.JSX.Element {
  const loading = useNightwaveStore((s) => s.loading)
  const challenges = useNightwaveStore((s) => s.challenges)
  const init = useNightwaveStore((s) => s.init)
  const addChallenge = useNightwaveStore((s) => s.addChallenge)
  const toggleCompleted = useNightwaveStore((s) => s.toggleCompleted)
  const removeChallenge = useNightwaveStore((s) => s.removeChallenge)

  const [dailyTarget] = useState(getNextUtcMidnight)
  const [weeklyTarget] = useState(getNextWeeklyReset)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<NightwaveChallengeType>('daily')
  const t = useT()

  useEffect(() => {
    init()
  }, [init])

  const grouped = useMemo(() => {
    const groups: Record<NightwaveChallengeType, typeof challenges> = { daily: [], weekly: [], season: [] }
    for (const challenge of challenges) groups[challenge.type].push(challenge)
    return groups
  }, [challenges])

  async function handleAdd(event: FormEvent): Promise<void> {
    event.preventDefault()
    if (!title.trim()) return
    await addChallenge({ title: title.trim(), type })
    setTitle('')
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[var(--color-t2)]">{t('app.loading')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
      <h1 className="font-display text-xl font-extrabold tracking-wide text-[var(--color-tenno-gold)] uppercase">
        {t('sidebar.nav.nightwave')}
      </h1>

      <div className="grid grid-cols-2 gap-4">
        <ResetCountdown label={t('nightwave.dailyReset')} target={dailyTarget} />
        <ResetCountdown label={t('nightwave.weeklyReset')} target={weeklyTarget} />
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder={t('nightwave.challengeTitlePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-base)] px-3 py-2 text-sm"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as NightwaveChallengeType)}
          className="rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-base)] px-3 py-2 text-sm"
        >
          <option value="daily">{t('nightwave.type.daily')}</option>
          <option value="weekly">{t('nightwave.type.weekly')}</option>
          <option value="season">{t('nightwave.type.season')}</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-tenno-gold)] px-4 py-2 text-sm font-semibold text-black"
        >
          {t('nightwave.add')}
        </button>
      </form>

      {(['daily', 'weekly', 'season'] as const).map((groupType) => (
        <div key={groupType} className="surface-base rounded-lg p-4">
          <h2 className="mb-2 font-mono text-sm font-semibold tracking-wide text-[var(--color-tenno-cyan)] uppercase">
            {t(TYPE_LABEL_KEYS[groupType])}
          </h2>
          {grouped[groupType].length === 0 && (
            <p className="text-sm text-[var(--color-t2)]">{t('nightwave.empty')}</p>
          )}
          <ul className="space-y-1">
            {grouped[groupType].map((challenge) => (
              <li key={challenge.id} className="flex items-center justify-between text-sm">
                <label className="flex flex-1 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={challenge.completed}
                    onChange={(e) => toggleCompleted(challenge.id, e.target.checked)}
                  />
                  <span className={challenge.completed ? 'text-[var(--color-t2)] line-through' : ''}>
                    {challenge.title}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => removeChallenge(challenge.id)}
                  className="text-[var(--color-t2)] hover:text-[var(--color-danger)]"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default NightwaveTracker
