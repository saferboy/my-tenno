import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useRivenStore } from '../store/useRivenStore'
import { WEAPON_CATEGORIES } from '../constants'

// TDD 5.5: Riven'lar foydalanuvchi tomonidan qo'lda kiritiladi (rasmiy API
// riven roll natijalarini bermaydi); dispozitsiya esa master data'dan
// (weaponUniqueName orqali) olinadi.
function RivenTracker(): React.JSX.Element {
  const items = useAppStore((s) => s.items)
  const loading = useRivenStore((s) => s.loading)
  const rivens = useRivenStore((s) => s.rivens)
  const init = useRivenStore((s) => s.init)
  const addRiven = useRivenStore((s) => s.addRiven)
  const updateRiven = useRivenStore((s) => s.updateRiven)
  const removeRiven = useRivenStore((s) => s.removeRiven)

  useEffect(() => {
    init()
  }, [init])

  const weapons = useMemo(
    () => items.filter((i) => WEAPON_CATEGORIES.has(i.category)).sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  )
  const weaponByUniqueName = useMemo(() => new Map(items.map((i) => [i.uniqueName, i])), [items])

  const [weaponUniqueName, setWeaponUniqueName] = useState('')
  const [statsInput, setStatsInput] = useState('')
  const [targetNotes, setTargetNotes] = useState('')

  async function handleAdd(event: FormEvent): Promise<void> {
    event.preventDefault()
    const weapon = weaponByUniqueName.get(weaponUniqueName)
    if (!weapon) return

    const stats = statsInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    await addRiven({
      weaponUniqueName: weapon.uniqueName,
      weaponName: weapon.name,
      stats,
      targetNotes: targetNotes.trim() || null
    })

    setStatsInput('')
    setTargetNotes('')
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
      <h1 className="text-xl font-bold tracking-wide text-[var(--orokin-gold)] uppercase">Riven Mod Tracker</h1>

      <form
        onSubmit={handleAdd}
        className="chamfer flex flex-col gap-2 border border-[var(--orokin-border)] bg-[var(--orokin-panel)] p-4"
      >
        <select
          value={weaponUniqueName}
          onChange={(e) => setWeaponUniqueName(e.target.value)}
          required
          className="chamfer border border-[var(--orokin-border)] bg-[var(--orokin-bg)] px-3 py-2 text-sm"
        >
          <option value="">Qurolni tanlang...</option>
          {weapons.map((weapon) => (
            <option key={weapon.uniqueName} value={weapon.uniqueName}>
              {weapon.name} (Disp: {String(weapon.disposition ?? '-')})
            </option>
          ))}
        </select>
        <textarea
          placeholder="Statlar (har biri yangi qatorda)"
          value={statsInput}
          onChange={(e) => setStatsInput(e.target.value)}
          className="chamfer border border-[var(--orokin-border)] bg-[var(--orokin-bg)] px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Maqsad (ixtiyoriy)"
          value={targetNotes}
          onChange={(e) => setTargetNotes(e.target.value)}
          className="chamfer border border-[var(--orokin-border)] bg-[var(--orokin-bg)] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="chamfer self-start bg-[var(--orokin-gold)] px-4 py-2 text-sm font-semibold text-black"
        >
          Riven qo&apos;shish
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {rivens.map((riven) => {
          const weapon = riven.weaponUniqueName ? weaponByUniqueName.get(riven.weaponUniqueName) : undefined
          return (
            <div key={riven.id} className="chamfer border border-[var(--orokin-border)] bg-[var(--orokin-panel)] p-4">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="font-semibold">{riven.weaponName}</h3>
                <span className="text-xs text-[var(--orokin-text-dim)]">
                  Disp: {weapon ? String(weapon.disposition ?? '-') : '-'}
                </span>
              </div>

              {riven.stats.length > 0 && (
                <ul className="mb-2 space-y-0.5 text-sm text-[var(--orokin-cyan)]">
                  {riven.stats.map((stat, index) => (
                    <li key={index}>{stat}</li>
                  ))}
                </ul>
              )}

              {riven.targetNotes && (
                <p className="mb-2 text-xs text-[var(--orokin-text-dim)]">Maqsad: {riven.targetNotes}</p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span>Reroll: {riven.rerollCount}</span>
                  <button
                    type="button"
                    onClick={() => updateRiven(riven.id, { rerollCount: riven.rerollCount + 1 })}
                    className="chamfer border border-[var(--orokin-border)] px-2 py-0.5 text-xs hover:bg-[var(--orokin-border)]"
                  >
                    +1
                  </button>
                </div>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={riven.mastered}
                    onChange={(e) => updateRiven(riven.id, { mastered: e.target.checked })}
                  />
                  Mastered
                </label>
                <button
                  type="button"
                  onClick={() => removeRiven(riven.id)}
                  className="text-[var(--orokin-text-dim)] hover:text-red-400"
                >
                  O&apos;chirish
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RivenTracker
