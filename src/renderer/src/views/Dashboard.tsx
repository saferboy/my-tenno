import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { WEAPON_CATEGORIES } from '../constants'
import StatTile from '../components/StatTile'
import ProgressBar from '../components/ProgressBar'
import { useT } from '../i18n/useT'
import type { TranslationKey } from '../i18n/translations'

// Dashboard'dagi "Kategoriya bo'yicha taqsimot" tartibi - Sidebar'dagi
// guruhlash mantig'iga yaqin (avval Warframes, so'ng qurol turlari, oxirida
// Companion). "Quests" master data'da bor, lekin item_status orqali
// owned/maxed kuzatilmagani uchun bu ro'yxatda yo'q.
const BREAKDOWN_CATEGORIES: { category: string; labelKey: TranslationKey }[] = [
  { category: 'Warframes', labelKey: 'dashboard.category.Warframes' },
  { category: 'Primary', labelKey: 'dashboard.category.Primary' },
  { category: 'Secondary', labelKey: 'dashboard.category.Secondary' },
  { category: 'Melee', labelKey: 'dashboard.category.Melee' },
  { category: 'Sentinels', labelKey: 'dashboard.category.Sentinels' },
  { category: 'SentinelWeapons', labelKey: 'dashboard.category.SentinelWeapons' },
  { category: 'Archwing', labelKey: 'dashboard.category.Archwing' },
  { category: 'Arch-Gun', labelKey: 'dashboard.category.Arch-Gun' },
  { category: 'Arch-Melee', labelKey: 'dashboard.category.Arch-Melee' },
  { category: 'Pets', labelKey: 'dashboard.category.Pets' }
]

function Dashboard(): React.JSX.Element {
  const items = useAppStore((s) => s.items)
  const statusByItem = useAppStore((s) => s.statusByItem)
  const t = useT()

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

  const breakdown = useMemo(() => {
    const counts = new Map<string, { owned: number; total: number }>()
    for (const item of items) {
      const entry = counts.get(item.category) ?? { owned: 0, total: 0 }
      entry.total++
      if (statusByItem[item.uniqueName]?.owned) entry.owned++
      counts.set(item.category, entry)
    }
    return BREAKDOWN_CATEGORIES.map(({ category, labelKey }) => ({
      labelKey,
      ...(counts.get(category) ?? { owned: 0, total: 0 })
    })).filter((row) => row.total > 0)
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
        {t('dashboard.title')}
      </h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label={t('dashboard.stat.weaponMaxed')}
          value={`${stats.weaponMaxed}/${stats.weaponTotal}`}
          accentColor="#ffe066"
        />
        <StatTile
          label={t('dashboard.stat.frameOwned')}
          value={`${stats.frameOwned}/${stats.frameTotal}`}
          accentColor="#7b61ff"
        />
        <StatTile
          label={t('dashboard.stat.owned')}
          value={`${stats.owned}/${stats.total}`}
          accentColor="#3a86ff"
        />
        <StatTile
          label={t('dashboard.stat.overallPct')}
          value={`${Math.round(stats.overallPct * 100)}%`}
          accentColor="#00d2ff"
        />
      </div>

      <div className="surface-base rounded-lg p-4">
        <p className="mb-2 font-mono text-[10px] tracking-widest text-[var(--color-t3)] uppercase">
          {t('dashboard.collection')}
        </p>
        <ProgressBar value={stats.overallPct} />
      </div>

      <div className="surface-base rounded-lg p-4">
        <p className="mb-3 font-mono text-[10px] tracking-widest text-[var(--color-t3)] uppercase">
          {t('dashboard.breakdown')}
        </p>
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {breakdown.map((row) => (
            <div key={row.labelKey} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-sm text-[var(--color-t2)]">
                {t(row.labelKey)}
              </span>
              <ProgressBar value={row.total ? row.owned / row.total : 0} height={6} />
              <span className="w-14 shrink-0 text-right font-mono text-xs text-[var(--color-t3)]">
                {row.owned}/{row.total}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-base rounded-lg p-4">
        <p className="mb-2 font-mono text-[10px] tracking-widest text-[var(--color-t3)] uppercase">
          {t('dashboard.recentActivity')}
        </p>
        {recent.length === 0 && (
          <p className="text-sm text-[var(--color-t2)]">{t('dashboard.noRecentActivity')}</p>
        )}
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
