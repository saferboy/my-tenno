import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNightwaveStore } from '../store/useNightwaveStore'
import ResetCountdown from '../components/ResetCountdown'
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

const TYPE_LABELS: Record<NightwaveChallengeType, string> = {
  daily: 'Kunlik',
  weekly: 'Haftalik',
  season: 'Mavsum'
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
        <p className="text-[var(--orokin-text-dim)]">Yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
      <h1 className="text-xl font-bold tracking-wide text-[var(--orokin-gold)] uppercase">Nightwave</h1>

      <div className="grid grid-cols-2 gap-4">
        <ResetCountdown label="Kunlik reset" target={dailyTarget} />
        <ResetCountdown label="Haftalik reset" target={weeklyTarget} />
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Challenge nomi"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="chamfer flex-1 border border-[var(--orokin-border)] bg-[var(--orokin-panel)] px-3 py-2 text-sm"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as NightwaveChallengeType)}
          className="chamfer border border-[var(--orokin-border)] bg-[var(--orokin-panel)] px-3 py-2 text-sm"
        >
          <option value="daily">Kunlik</option>
          <option value="weekly">Haftalik</option>
          <option value="season">Mavsum</option>
        </select>
        <button type="submit" className="chamfer bg-[var(--orokin-gold)] px-4 py-2 text-sm font-semibold text-black">
          Qo'shish
        </button>
      </form>

      {(['daily', 'weekly', 'season'] as const).map((groupType) => (
        <div key={groupType} className="chamfer border border-[var(--orokin-border)] bg-[var(--orokin-panel)] p-4">
          <h2 className="mb-2 text-sm font-semibold text-[var(--orokin-cyan)] uppercase">{TYPE_LABELS[groupType]}</h2>
          {grouped[groupType].length === 0 && (
            <p className="text-sm text-[var(--orokin-text-dim)]">Hali challenge qo'shilmagan.</p>
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
                  <span className={challenge.completed ? 'text-[var(--orokin-text-dim)] line-through' : ''}>
                    {challenge.title}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => removeChallenge(challenge.id)}
                  className="text-[var(--orokin-text-dim)] hover:text-red-400"
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
