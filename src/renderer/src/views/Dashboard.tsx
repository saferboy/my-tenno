import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { WEAPON_CATEGORIES } from '../constants'
import StatTile from '../components/StatTile'
import ProgressBar from '../components/ProgressBar'

function Dashboard(): React.JSX.Element {
  const items = useAppStore((s) => s.items)
  const statusByItem = useAppStore((s) => s.statusByItem)

  const stats = useMemo(() => {
    let weaponTotal = 0
    let weaponMaxed = 0
    let frameTotal = 0
    let frameOwned = 0
    let owned = 0

    for (const item of items) {
      const status = statusByItem[item.uniqueName]
      if (status?.owned) owned++

      if (WEAPON_CATEGORIES.has(item.category)) {
        weaponTotal++
        if (status?.maxed) weaponMaxed++
      }
      if (item.category === 'Warframes') {
        frameTotal++
        if (status?.owned) frameOwned++
      }
    }

    return {
      weaponTotal,
      weaponMaxed,
      frameTotal,
      frameOwned,
      owned,
      total: items.length,
      overallPct: items.length ? owned / items.length : 0
    }
  }, [items, statusByItem])

  const recent = useMemo(() => {
    return Object.values(statusByItem)
      .slice()
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
      .slice(0, 5)
      .map((status) => ({
        status,
        item: items.find((i) => i.uniqueName === status.itemUniqueName)
      }))
  }, [items, statusByItem])

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
      <h1 className="font-display text-xl font-extrabold tracking-wide text-[var(--color-tenno-gold)] uppercase">
        Dashboard
      </h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Max qilingan qurollar" value={`${stats.weaponMaxed}/${stats.weaponTotal}`} accentColor="#c9a84c" />
        <StatTile label="Yig'ilgan Frame'lar" value={`${stats.frameOwned}/${stats.frameTotal}`} accentColor="#7b61ff" />
        <StatTile label="Umumiy egalik" value={`${stats.owned}/${stats.total}`} accentColor="#3a86ff" />
        <StatTile label="Umumiy foiz" value={`${Math.round(stats.overallPct * 100)}%`} accentColor="#4ecdc4" />
      </div>

      <div className="surface-base rounded-lg p-4">
        <p className="mb-2 font-mono text-[10px] tracking-widest text-[var(--color-t3)] uppercase">
          Umumiy kolleksiya
        </p>
        <ProgressBar value={stats.overallPct} />
      </div>

      <div className="surface-base rounded-lg p-4">
        <p className="mb-2 font-mono text-[10px] tracking-widest text-[var(--color-t3)] uppercase">
          So&apos;nggi faoliyat
        </p>
        {recent.length === 0 && <p className="text-sm text-[var(--color-t2)]">Hali o&apos;zgarish yo&apos;q.</p>}
        <ul className="space-y-1">
          {recent.map(({ status, item }) => (
            <li
              key={status.itemUniqueName}
              className="flex justify-between border-b border-[var(--color-void-border)] py-1.5 text-sm"
            >
              <span className="text-[var(--color-t1)]">{item?.name ?? status.itemUniqueName}</span>
              <span className="font-mono text-xs text-[var(--color-t3)]">
                {new Date(status.updatedAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Dashboard
