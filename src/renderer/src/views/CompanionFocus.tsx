import { useEffect, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useCompanionStore } from '../store/useCompanionStore'

// TDD 5.6: Companion'lar master data'dagi "Pets" kategoriyasidan olinadi
// (Arsenal bilan bir xil item_status orqali owned/maxed), DNA stabilligi
// esa companion'larga xos alohida jadvalda saqlanadi. Focus School'lar
// statik (5 ta), faqat rank/notes tahrirlanadi.
function CompanionFocus(): React.JSX.Element {
  const items = useAppStore((s) => s.items)
  const itemStatusByItem = useAppStore((s) => s.statusByItem)
  const updateItemStatus = useAppStore((s) => s.updateStatus)

  const loading = useCompanionStore((s) => s.loading)
  const companionStatusByItem = useCompanionStore((s) => s.companionStatusByItem)
  const focusSchools = useCompanionStore((s) => s.focusSchools)
  const init = useCompanionStore((s) => s.init)
  const setDnaStability = useCompanionStore((s) => s.setDnaStability)
  const updateFocusSchool = useCompanionStore((s) => s.updateFocusSchool)

  useEffect(() => {
    init()
  }, [init])

  const companions = useMemo(
    () => items.filter((item) => item.category === 'Pets').sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  )

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[var(--color-t2)]">Yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
      <h1 className="font-display text-xl font-extrabold tracking-wide text-[var(--color-tenno-gold)] uppercase">
        Companion &amp; Focus
      </h1>

      <div className="surface-base rounded-lg p-4">
        <h2 className="mb-2 font-mono text-sm font-semibold tracking-wide text-[var(--color-tenno-cyan)] uppercase">
          Companion&apos;lar
        </h2>
        <ul className="space-y-1">
          {companions.map((companion) => {
            const itemStatus = itemStatusByItem[companion.uniqueName]
            const dnaStability = companionStatusByItem[companion.uniqueName]?.dnaStability ?? null
            return (
              <li
                key={companion.uniqueName}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-void-border)] py-2 text-sm"
              >
                <span className="min-w-40">{companion.name}</span>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={Boolean(itemStatus?.owned)}
                    onChange={(e) => updateItemStatus(companion.uniqueName, { owned: e.target.checked })}
                  />
                  Owned
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={Boolean(itemStatus?.maxed)}
                    onChange={(e) => updateItemStatus(companion.uniqueName, { maxed: e.target.checked })}
                  />
                  Maxed
                </label>
                <label className="flex items-center gap-1">
                  DNA
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={dnaStability ?? ''}
                    onChange={(e) =>
                      setDnaStability(companion.uniqueName, e.target.value === '' ? null : Number(e.target.value))
                    }
                    className="w-16 rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-black)] px-2 py-1"
                  />
                  %
                </label>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="surface-base rounded-lg p-4">
        <h2 className="mb-2 font-mono text-sm font-semibold tracking-wide text-[var(--color-tenno-cyan)] uppercase">
          Focus Schools
        </h2>
        <ul className="space-y-2">
          {focusSchools.map((school) => (
            <li key={school.schoolName} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="w-24">{school.schoolName}</span>
              <label className="flex items-center gap-1">
                Rank
                <input
                  type="number"
                  min={0}
                  value={school.rank}
                  onChange={(e) => updateFocusSchool(school.schoolName, { rank: Number(e.target.value) })}
                  className="w-16 rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-black)] px-2 py-1"
                />
              </label>
              <input
                type="text"
                placeholder="Izoh (masalan, yig'ilgan Focus)"
                value={school.notes ?? ''}
                onChange={(e) => updateFocusSchool(school.schoolName, { notes: e.target.value })}
                className="flex-1 rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-black)] px-2 py-1"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CompanionFocus
