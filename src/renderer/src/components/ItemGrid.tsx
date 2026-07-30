import { useEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import Fuse from 'fuse.js'
import { useAppStore, type StatusFilter } from '../store/useAppStore'
import { filterItems } from '../store/selectors'
import ItemCard from './ItemCard'
import ItemDrawer from './ItemDrawer'
import type { WarframeItem } from '../../../main/masterData/types'

const CARD_MIN_WIDTH = 160
const CARD_HEIGHT = 196
const GAP = 12

interface ItemGridProps {
  title: string
  categoryScope: Set<string>
  defaultStatusFilter?: StatusFilter
}

// Arsenal'dan ajratilgan (Weapons/Warframes sahifalari uchun) qayta
// ishlatiladigan virtualized grid - 1000+ elementni bir vaqtda DOM'ga
// chiqarmaslik uchun row-bazaviy virtualization (@tanstack/react-virtual).
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(defaultStatusFilter)
  const [selected, setSelected] = useState<WarframeItem | null>(null)
  const [containerWidth, setContainerWidth] = useState(800)
  const parentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = parentRef.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width) setContainerWidth(width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const categories = useMemo(() => Array.from(new Set(scopedItems.map((i) => i.category))).sort(), [scopedItems])

  const filtered = useMemo(
    () => filterItems({ items: scopedItems, fuse, searchQuery, categoryFilter, statusFilter, statusByItem }),
    [scopedItems, fuse, searchQuery, categoryFilter, statusFilter, statusByItem]
  )

  const owned = useMemo(
    () => scopedItems.filter((i) => statusByItem[i.uniqueName]?.owned).length,
    [scopedItems, statusByItem]
  )
  const maxed = useMemo(
    () => scopedItems.filter((i) => statusByItem[i.uniqueName]?.maxed).length,
    [scopedItems, statusByItem]
  )

  const columns = Math.max(1, Math.floor(containerWidth / (CARD_MIN_WIDTH + GAP)))
  const rowCount = Math.ceil(filtered.length / columns)

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 5
  })

  const selectedStatus = selected ? statusByItem[selected.uniqueName] : undefined

  return (
    <div className="flex flex-1 flex-col gap-4 p-8">
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
            onChange={(e) => setCategoryFilter(e.target.value || null)}
            className="rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-base)] px-3 py-2 text-sm"
          >
            <option value="">Barcha turlar</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
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

      <div ref={parentRef} className="flex-1 overflow-y-auto">
        <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const rowItems = filtered.slice(virtualRow.index * columns, virtualRow.index * columns + columns)
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  gap: GAP
                }}
              >
                {rowItems.map((item) => (
                  <ItemCard
                    key={item.uniqueName}
                    item={item}
                    status={statusByItem[item.uniqueName]}
                    onClick={() => setSelected(item)}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>

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
