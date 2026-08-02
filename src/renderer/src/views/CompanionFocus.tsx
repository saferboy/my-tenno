import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { useCompanionStore } from '../store/useCompanionStore'
import Pagination from '../components/Pagination'
import ItemCard from '../components/ItemCard'
import ItemDrawer from '../components/ItemDrawer'
import { useT } from '../i18n/useT'
import type { WarframeItem } from '../../../main/masterData/types'

const PAGE_SIZE = 24

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
  const t = useT()

  useEffect(() => {
    init()
  }, [init])

  const companions = useMemo(
    () =>
      items.filter((item) => item.category === 'Pets').sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  )

  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<WarframeItem | null>(null)
  const pageCount = Math.max(1, Math.ceil(companions.length / PAGE_SIZE))
  const pageCompanions = companions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const selectedItemStatus = selected ? itemStatusByItem[selected.uniqueName] : undefined
  const selectedDnaStability = selected
    ? (companionStatusByItem[selected.uniqueName]?.dnaStability ?? null)
    : null

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
        {t('companion.pageTitle')}
      </h1>

      <div className="surface-base rounded-lg p-4">
        <h2 className="mb-2 font-mono text-sm font-semibold tracking-wide text-[var(--color-tenno-cyan)] uppercase">
          {t('companion.listTitle')}
        </h2>
        <div className="grid auto-rows-[196px] grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
          {pageCompanions.map((companion) => (
            <ItemCard
              key={companion.uniqueName}
              item={companion}
              status={itemStatusByItem[companion.uniqueName]}
              onClick={() => setSelected(companion)}
            />
          ))}
        </div>
        <Pagination page={page} pageCount={pageCount} onChange={setPage} />
      </div>

      <div className="surface-base rounded-lg p-4">
        <h2 className="mb-2 font-mono text-sm font-semibold tracking-wide text-[var(--color-tenno-cyan)] uppercase">
          {t('companion.focusSchools')}
        </h2>
        <ul className="space-y-2">
          {focusSchools.map((school) => (
            <li key={school.schoolName} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="w-24">{school.schoolName}</span>
              <label className="flex items-center gap-1">
                {t('common.rank')}
                <input
                  type="number"
                  min={0}
                  value={school.rank}
                  onChange={(e) =>
                    updateFocusSchool(school.schoolName, { rank: Number(e.target.value) })
                  }
                  className="w-16 rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-black)] px-2 py-1"
                />
              </label>
              <input
                type="text"
                placeholder={t('companion.notesPlaceholder')}
                value={school.notes ?? ''}
                onChange={(e) => updateFocusSchool(school.schoolName, { notes: e.target.value })}
                className="flex-1 rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-black)] px-2 py-1"
              />
            </li>
          ))}
        </ul>
      </div>

      <AnimatePresence>
        {selected && (
          <ItemDrawer
            item={selected}
            status={selectedItemStatus}
            onChange={(patch) => updateItemStatus(selected.uniqueName, patch)}
            onClose={() => setSelected(null)}
            extra={
              <label className="flex flex-col gap-1 text-sm">
                {t('companion.dnaStability')}
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={selectedDnaStability ?? ''}
                  onChange={(e) =>
                    setDnaStability(
                      selected.uniqueName,
                      e.target.value === '' ? null : Number(e.target.value)
                    )
                  }
                  className="rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-black)] px-2 py-1"
                />
              </label>
            }
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default CompanionFocus
