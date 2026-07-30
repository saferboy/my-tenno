import { useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { useAppStore, type StatusFilter } from '../store/useAppStore'
import { filterItems } from '../store/selectors'
import ItemCard from './ItemCard'
import ItemDrawer from './ItemDrawer'
import Pagination from './Pagination'
import type { WarframeItem } from '../../../main/masterData/types'

const PAGE_SIZE = 24

interface ItemGridProps {
  title: string
  categoryScope: Set<string>
  defaultStatusFilter?: StatusFilter
}

// Arsenal'dan ajratilgan (Weapons/Warframes sahifalari uchun) qayta
// ishlatiladigan grid - sahifalash (24 tadan) bilan, cheksiz scroll o'rniga.
// Qidiruv/filtr holati bu komponentga xos (mahalliy) - shu bilan har
// sahifa o'z filtrini mustaqil saqlaydi.
function ItemGrid({ title, categoryScope, defaultStatusFilter = 'all' }: ItemGridProps): React.JSX.Element {
  const allItems = useAppStore((s) => s.items)
  const statusByItem = useAppStore((s) => s.statusByItem)
  const updateStatus = useAppStore((s) => s.updateStatus)

  const scopedItems = useMemo(() => allItems.filter((i) => categoryScope.has(i.category)), [allItems, categoryScope])
  const fuse = useMemo(() => new Fuse(scopedItems, { keys: ['name', 'category'], threshold: 0.3 }), [scopedItems])

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(defaultStatusFilter)
  const [selected, setSelected] = useState<WarframeItem | null>(null)
  const [page, setPage] = useState(0)

  // Har qanday filtr o'zgarganda 1-sahifaga qaytish - render vaqtida
  // to'g'ridan-to'g'ri (useEffect emas, React'ning "adjusting state" patterni)
  // - aks holda foydalanuvchi filtrlangan (qisqargan) ro'yxatda mavjud
  // bo'lmagan sahifada qolib ketishi mumkin edi.
  const filterKey = `${searchQuery}|${categoryFilter}|${typeFilter}|${statusFilter}`
  const [lastFilterKey, setLastFilterKey] = useState(filterKey)
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey)
    setPage(0)
  }

  const categories = useMemo(() => Array.from(new Set(scopedItems.map((i) => i.category))).sort(), [scopedItems])

  // O'yin-ichi Arsenal'dagi kabi ikki bosqichli filtr: avval slot (Primary/
  // Secondary/...), so'ng shu slot ichidagi qurol turi (Rifle/Shotgun/Bow/
  // Sniper/... - item.type maydonidan). Kategoriya o'zgarganda turlar
  // ro'yxati ham yangilanadi, shuning uchun turi filtri kontekstga mos.
  const itemsInCategory = useMemo(
    () => (categoryFilter ? scopedItems.filter((i) => i.category === categoryFilter) : scopedItems),
    [scopedItems, categoryFilter]
  )
  const types = useMemo(
    () => Array.from(new Set(itemsInCategory.map((i) => i.type).filter((t): t is string => Boolean(t)))).sort(),
    [itemsInCategory]
  )

  const filtered = useMemo(() => {
    const byStandardFilters = filterItems({ items: scopedItems, fuse, searchQuery, categoryFilter, statusFilter, statusByItem })
    return typeFilter ? byStandardFilters.filter((i) => i.type === typeFilter) : byStandardFilters
  }, [scopedItems, fuse, searchQuery, categoryFilter, typeFilter, statusFilter, statusByItem])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
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
            OWNED{' '}
            <span className="text-[var(--color-tenno-cyan)]">
              {owned}/{scopedItems.length}
            </span>
          </span>
          <span>
            MAXED{' '}
            <span className="text-[var(--color-tenno-gold)]">
              {maxed}/{scopedItems.length}
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Qidirish..."
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
            <option value="">Barcha kategoriyalar</option>
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
            <option value="">Barcha turlar</option>
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
              {filter}
            </button>
          ))}
        </div>
        <span className="ml-auto self-center font-mono text-xs text-[var(--color-t3)]">
          {filtered.length} ta topildi
        </span>
      </div>

      <div className="grid auto-rows-[196px] grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
        {pageItems.map((item) => (
          <ItemCard
            key={item.uniqueName}
            item={item}
            status={statusByItem[item.uniqueName]}
            onClick={() => setSelected(item)}
          />
        ))}
      </div>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />

      {selected && (
        <ItemDrawer
          item={selected}
          status={selectedStatus}
          onChange={(patch) => updateStatus(selected.uniqueName, patch)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

export default ItemGrid
