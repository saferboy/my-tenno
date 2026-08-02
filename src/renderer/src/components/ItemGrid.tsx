import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Fuse from 'fuse.js'
import { useAppStore, type StatusFilter } from '../store/useAppStore'
import { filterItems } from '../store/selectors'
import ItemCard from './ItemCard'
import ItemDrawer from './ItemDrawer'
import Pagination from './Pagination'
import { useT } from '../i18n/useT'
import type { TranslationKey } from '../i18n/translations'
import type { WarframeItem } from '../../../main/masterData/types'

const FILTER_LABELS: Record<StatusFilter, TranslationKey> = {
  all: 'itemGrid.filter.all',
  owned: 'itemGrid.filter.owned',
  maxed: 'itemGrid.filter.maxed',
  'not-owned': 'itemGrid.filter.notOwned'
}

// grid-cols-[repeat(auto-fill,minmax(160px,1fr))] va auto-rows-[196px]
// bilan bir xil o'lchamlar - shu orqali sahifa hajmi (PAGE_SIZE) ustun/qator
// sonidan hisoblanadi va grid har doim to'liq to'ladi (oxirgi qatorda
// bo'sh joy yoki pastda ishlatilmagan balandlik qolmaydi).
const CARD_WIDTH = 160
const CARD_HEIGHT = 196
const GRID_GAP = 12
const DEFAULT_GRID_SIZE = { columns: 6, rows: 4 }

interface ItemGridProps {
  title: string
  categoryScope: Set<string>
  defaultStatusFilter?: StatusFilter
}

// Arsenal'dan ajratilgan (Weapons/Warframes sahifalari uchun) qayta
// ishlatiladigan grid - sahifalash (24 tadan) bilan, cheksiz scroll o'rniga.
// Qidiruv/filtr holati bu komponentga xos (mahalliy) - shu bilan har
// sahifa o'z filtrini mustaqil saqlaydi.
function ItemGrid({
  title,
  categoryScope,
  defaultStatusFilter = 'all'
}: ItemGridProps): React.JSX.Element {
  const allItems = useAppStore((s) => s.items)
  const statusByItem = useAppStore((s) => s.statusByItem)
  const updateStatus = useAppStore((s) => s.updateStatus)
  const t = useT()

  const scopedItems = useMemo(
    () => allItems.filter((i) => categoryScope.has(i.category)),
    [allItems, categoryScope]
  )
  const fuse = useMemo(
    () => new Fuse(scopedItems, { keys: ['name', 'category'], threshold: 0.3 }),
    [scopedItems]
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(defaultStatusFilter)
  const [selected, setSelected] = useState<WarframeItem | null>(null)
  const [page, setPage] = useState(0)

  const gridWrapRef = useRef<HTMLDivElement>(null)
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE)

  useLayoutEffect(() => {
    const el = gridWrapRef.current
    if (!el) return undefined
    const measure = (): void => {
      const { width, height } = el.getBoundingClientRect()
      const columns = Math.max(1, Math.floor((width + GRID_GAP) / (CARD_WIDTH + GRID_GAP)))
      const rows = Math.max(1, Math.floor((height + GRID_GAP) / (CARD_HEIGHT + GRID_GAP)))
      setGridSize((prev) =>
        prev.columns === columns && prev.rows === rows ? prev : { columns, rows }
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const PAGE_SIZE = gridSize.columns * gridSize.rows

  // Har qanday filtr o'zgarganda 1-sahifaga qaytish - render vaqtida
  // to'g'ridan-to'g'ri (useEffect emas, React'ning "adjusting state" patterni)
  // - aks holda foydalanuvchi filtrlangan (qisqargan) ro'yxatda mavjud
  // bo'lmagan sahifada qolib ketishi mumkin edi.
  const filterKey = `${searchQuery}|${categoryFilter}|${typeFilter}|${statusFilter}|${PAGE_SIZE}`
  const [lastFilterKey, setLastFilterKey] = useState(filterKey)
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey)
    setPage(0)
  }

  const categories = useMemo(
    () => Array.from(new Set(scopedItems.map((i) => i.category))).sort(),
    [scopedItems]
  )

  // O'yin-ichi Arsenal'dagi kabi ikki bosqichli filtr: avval slot (Primary/
  // Secondary/...), so'ng shu slot ichidagi qurol turi (Rifle/Shotgun/Bow/
  // Sniper/... - item.type maydonidan). Kategoriya o'zgarganda turlar
  // ro'yxati ham yangilanadi, shuning uchun turi filtri kontekstga mos.
  const itemsInCategory = useMemo(
    () => (categoryFilter ? scopedItems.filter((i) => i.category === categoryFilter) : scopedItems),
    [scopedItems, categoryFilter]
  )
  const types = useMemo(
    () =>
      Array.from(
        new Set(itemsInCategory.map((i) => i.type).filter((t): t is string => Boolean(t)))
      ).sort(),
    [itemsInCategory]
  )

  const filtered = useMemo(() => {
    const byStandardFilters = filterItems({
      items: scopedItems,
      fuse,
      searchQuery,
      categoryFilter,
      statusFilter,
      statusByItem
    })
    return typeFilter ? byStandardFilters.filter((i) => i.type === typeFilter) : byStandardFilters
  }, [scopedItems, fuse, searchQuery, categoryFilter, typeFilter, statusFilter, statusByItem])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  // Filtr mezonlari o'zgarmasa ham, ro'yxat qisqarishi mumkin (masalan
  // "Egalik qilinmagan" filtri faol bo'lsa-yu, Drawer orqali oxirgi
  // sahifadagi biror itemni "Owned" deb belgilasangiz) - shunda joriy
  // sahifa mavjud bo'lmagan sahifaga aylanib, bo'sh grid ko'rsatardi.
  if (page > pageCount - 1) {
    setPage(pageCount - 1)
  }

  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const owned = useMemo(
    () => scopedItems.filter((i) => statusByItem[i.uniqueName]?.owned).length,
    [scopedItems, statusByItem]
  )
  const maxed = useMemo(
    () => scopedItems.filter((i) => statusByItem[i.uniqueName]?.maxed).length,
    [scopedItems, statusByItem]
  )

  const selectedStatus = selected ? statusByItem[selected.uniqueName] : undefined

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-xl font-extrabold tracking-wide text-[var(--color-tenno-gold)] uppercase">
          {title}
        </h1>
        <div className="flex gap-4 font-mono text-xs text-[var(--color-t3)]">
          <span>
            {t('itemGrid.ownedStat')}{' '}
            <span className="text-[var(--color-tenno-cyan)]">
              {owned}/{scopedItems.length}
            </span>
          </span>
          <span>
            {t('itemGrid.maxedStat')}{' '}
            <span className="text-[var(--color-tenno-gold)]">
              {maxed}/{scopedItems.length}
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder={t('common.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-base)] px-3 py-2 text-sm"
        />
        {categories.length > 1 && (
          <select
            value={categoryFilter ?? ''}
            onChange={(e) => {
              setCategoryFilter(e.target.value || null)
              setTypeFilter(null)
            }}
            className="rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-base)] px-3 py-2 text-sm"
          >
            <option value="">{t('common.allCategories')}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        )}
        {types.length > 1 && (
          <select
            value={typeFilter ?? ''}
            onChange={(e) => setTypeFilter(e.target.value || null)}
            className="rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-base)] px-3 py-2 text-sm"
          >
            <option value="">{t('common.allTypes')}</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        )}
        <div className="flex gap-1">
          {(['all', 'owned', 'maxed', 'not-owned'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`t rounded-md px-3 py-2 text-xs uppercase ${
                statusFilter === filter
                  ? 'bg-[var(--color-tenno-gold)] text-black'
                  : 'border border-[var(--color-void-border)] text-[var(--color-t2)] hover:text-[var(--color-t1)]'
              }`}
            >
              {t(FILTER_LABELS[filter])}
            </button>
          ))}
        </div>
        <span className="ml-auto self-center font-mono text-xs text-[var(--color-t3)]">
          {t('common.resultsFound', { count: filtered.length })}
        </span>
      </div>

      <div ref={gridWrapRef} className="min-h-0 flex-1">
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-[var(--color-t2)]">{t('common.nothingFound')}</p>
          </div>
        ) : (
          <div
            className="grid h-full gap-3"
            style={{
              gridTemplateColumns: `repeat(${gridSize.columns}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridSize.rows}, minmax(0, 1fr))`
            }}
          >
            {pageItems.map((item) => (
              <ItemCard
                key={item.uniqueName}
                item={item}
                status={statusByItem[item.uniqueName]}
                onClick={() => setSelected(item)}
              />
            ))}
          </div>
        )}
      </div>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />

      <AnimatePresence>
        {selected && (
          <ItemDrawer
            item={selected}
            status={selectedStatus}
            onChange={(patch) => updateStatus(selected.uniqueName, patch)}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ItemGrid
