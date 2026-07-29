import { useEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useAppStore } from '../store/useAppStore'
import { filterItems } from '../store/selectors'
import ItemCard from '../components/ItemCard'
import ItemDrawer from '../components/ItemDrawer'
import type { WarframeItem } from '../../../main/masterData/types'

const CARD_MIN_WIDTH = 160
const CARD_HEIGHT = 96
const GAP = 12

// TDD 5.2: 1000+ elementni bir vaqtda DOM'ga chiqarmaslik uchun row-bazaviy
// virtualization (@tanstack/react-virtual).
function Arsenal(): React.JSX.Element {
  const items = useAppStore((s) => s.items)
  const fuse = useAppStore((s) => s.fuse)
  const statusByItem = useAppStore((s) => s.statusByItem)
  const searchQuery = useAppStore((s) => s.searchQuery)
  const categoryFilter = useAppStore((s) => s.categoryFilter)
  const statusFilter = useAppStore((s) => s.statusFilter)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const setCategoryFilter = useAppStore((s) => s.setCategoryFilter)
  const setStatusFilter = useAppStore((s) => s.setStatusFilter)
  const updateStatus = useAppStore((s) => s.updateStatus)

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

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category))).sort(), [items])

  const filtered = useMemo(
    () => filterItems({ items, fuse, searchQuery, categoryFilter, statusFilter, statusByItem }),
    [items, fuse, searchQuery, categoryFilter, statusFilter, statusByItem]
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
      <h1 className="text-xl font-bold tracking-wide text-[var(--orokin-gold)] uppercase">Arsenal</h1>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="chamfer border border-[var(--orokin-border)] bg-[var(--orokin-panel)] px-3 py-2 text-sm"
        />
        <select
          value={categoryFilter ?? ''}
          onChange={(e) => setCategoryFilter(e.target.value || null)}
          className="chamfer border border-[var(--orokin-border)] bg-[var(--orokin-panel)] px-3 py-2 text-sm"
        >
          <option value="">Barcha turlar</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <div className="flex gap-1">
          {(['all', 'owned', 'maxed', 'not-owned'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`chamfer px-3 py-2 text-xs uppercase ${
                statusFilter === filter
                  ? 'bg-[var(--orokin-gold)] text-black'
                  : 'border border-[var(--orokin-border)] text-[var(--orokin-text-dim)]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <span className="ml-auto self-center text-xs text-[var(--orokin-text-dim)]">{filtered.length} ta topildi</span>
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

export default Arsenal
