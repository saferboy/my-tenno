import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { WEAPON_CATEGORIES } from '../constants'

function StatCard({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="chamfer border border-[var(--orokin-border)] bg-[var(--orokin-panel)] p-4">
      <p className="text-xs tracking-wide text-[var(--orokin-text-dim)] uppercase">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[var(--orokin-gold)]">{value}</p>
    </div>
  )
}

function ProgressBar({ value }: { value: number }): React.JSX.Element {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--orokin-border)]">
      <div className="h-full bg-[var(--orokin-cyan)]" style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  )
}

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
      <h1 className="text-xl font-bold tracking-wide text-[var(--orokin-gold)] uppercase">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Max qilingan qurollar" value={`${stats.weaponMaxed}/${stats.weaponTotal}`} />
        <StatCard label="Yig'ilgan Frame'lar" value={`${stats.frameOwned}/${stats.frameTotal}`} />
        <StatCard label="Umumiy egalik" value={`${stats.owned}/${stats.total}`} />
        <StatCard label="Umumiy foiz" value={`${Math.round(stats.overallPct * 100)}%`} />
      </div>

      <div className="chamfer border border-[var(--orokin-border)] bg-[var(--orokin-panel)] p-4">
        <p className="mb-2 text-xs tracking-wide text-[var(--orokin-text-dim)] uppercase">Umumiy kolleksiya</p>
        <ProgressBar value={stats.overallPct} />
      </div>

      <div className="chamfer border border-[var(--orokin-border)] bg-[var(--orokin-panel)] p-4">
        <p className="mb-2 text-xs tracking-wide text-[var(--orokin-text-dim)] uppercase">So'nggi faoliyat</p>
        {recent.length === 0 && <p className="text-sm text-[var(--orokin-text-dim)]">Hali o'zgarish yo'q.</p>}
        <ul className="space-y-1">
          {recent.map(({ status, item }) => (
            <li
              key={status.itemUniqueName}
              className="flex justify-between border-b border-[var(--orokin-border)] py-1 text-sm"
            >
              <span>{item?.name ?? status.itemUniqueName}</span>
              <span className="text-[var(--orokin-text-dim)]">{new Date(status.updatedAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Dashboard
