import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import Fuse from 'fuse.js'
import { Coins, Gem, Clock, Hammer, Package } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { FOUNDRY_CATEGORIES } from '../constants'
import ItemCard from '../components/ItemCard'
import Pagination from '../components/Pagination'
import Panel from '../components/Panel'
import { useItemImage } from '../hooks/useItemImage'
import { useT } from '../i18n/useT'
import type { WarframeItem } from '../../../main/masterData/types'

interface RecipeComponent {
  uniqueName: string
  name: string
  itemCount: number
  imageName?: string
}

interface Buildable extends WarframeItem {
  buildPrice?: number
  buildTime?: number
  skipBuildTimePrice?: number
  components?: RecipeComponent[]
}

const CARD_WIDTH = 160
const CARD_HEIGHT = 196
const GRID_GAP = 12
const DEFAULT_GRID_SIZE = { columns: 6, rows: 4 }

function formatBuildTime(seconds: number, labels: { day: string; hour: string; minute: string }): string {
  if (seconds <= 0) return '0 ' + labels.minute
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) return `${days} ${labels.day} ${hours} ${labels.hour}`
  if (hours > 0) return `${hours} ${labels.hour} ${minutes} ${labels.minute}`
  return `${minutes} ${labels.minute}`
}

function ComponentRow({ component }: { component: RecipeComponent }): React.JSX.Element {
  const imageSrc = useItemImage(component.uniqueName, component.imageName)

  return (
    <div className="flex items-center gap-3 border-t border-[rgba(0,210,255,.08)] py-2 first:border-t-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--color-void-black)]">
        {imageSrc ? (
          <img src={imageSrc} alt={component.name} draggable={false} className="max-h-full max-w-full object-contain" />
        ) : (
          <Package size={16} className="text-[var(--color-t3)]" />
        )}
      </div>
      <span className="flex-1 truncate text-sm text-[#c4d4e2]">{component.name}</span>
      <span className="font-mono text-sm font-semibold text-[var(--color-tenno-cyan)] [font-variant-numeric:tabular-nums]">
        x{component.itemCount}
      </span>
    </div>
  )
}

// Kuznitsa - o'yindagi Orbiter Foundry'ga o'xshab, tanlangan qurol/Warframe
// uchun blueprint talablarini (Credits, qurish vaqti, kerakli resurslar)
// ko'rsatadi. Faqat ma'lumot beruvchi - build navbati yoki timer yo'q,
// chunki ilova o'yin holatini simulyatsiya qilmaydi.
function FoundryPage(): React.JSX.Element {
  const allItems = useAppStore((s) => s.items) as Buildable[]
  const t = useT()

  const buildable = useMemo(
    () => allItems.filter((i) => FOUNDRY_CATEGORIES.has(i.category) && (i.components?.length ?? 0) > 0),
    [allItems]
  )
  const fuse = useMemo(() => new Fuse(buildable, { keys: ['name', 'category'], threshold: 0.3 }), [buildable])

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [selected, setSelected] = useState<Buildable | null>(null)
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
      setGridSize((prev) => (prev.columns === columns && prev.rows === rows ? prev : { columns, rows }))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const PAGE_SIZE = gridSize.columns * gridSize.rows

  const categories = useMemo(() => Array.from(new Set(buildable.map((i) => i.category))).sort(), [buildable])

  const filtered = useMemo(() => {
    const base = searchQuery ? fuse.search(searchQuery).map((r) => r.item) : buildable
    return categoryFilter ? base.filter((i) => i.category === categoryFilter) : base
  }, [buildable, fuse, searchQuery, categoryFilter])

  const filterKey = `${searchQuery}|${categoryFilter}|${PAGE_SIZE}`
  const [lastFilterKey, setLastFilterKey] = useState(filterKey)
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey)
    setPage(0)
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  if (page > pageCount - 1) {
    setPage(pageCount - 1)
  }
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const timeLabels = { day: t('foundry.day'), hour: t('foundry.hour'), minute: t('foundry.minute') }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-display text-xl font-extrabold tracking-wide text-[var(--color-tenno-gold)] uppercase">
            {t('sidebar.nav.foundry')}
          </h1>
          <span className="font-mono text-xs text-[var(--color-t3)]">
            {t('common.resultsFound', { count: filtered.length })}
          </span>
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
              onChange={(e) => setCategoryFilter(e.target.value || null)}
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
                  status={undefined}
                  onClick={() => setSelected(item)}
                />
              ))}
            </div>
          )}
        </div>

        <Pagination page={page} pageCount={pageCount} onChange={setPage} />
      </div>

      <div
        className="flex w-[320px] shrink-0 flex-col gap-3.5 overflow-y-auto p-3.5"
        style={{ background: 'rgba(2,7,18,.4)', borderLeft: '1px solid rgba(0,210,255,.14)' }}
      >
        <Panel title={t('foundry.recipe')} icon={Hammer}>
          {selected ? (
            <div className="flex flex-col gap-3">
              <h3
                className="text-[18px] font-bold tracking-[2px] text-[#eaf6ff]"
                style={{ textShadow: '0 0 14px rgba(0,210,255,.5)' }}
              >
                {selected.name.toUpperCase()}
              </h3>

              <div className="flex flex-col gap-1.5 font-mono text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#8fa3b8]">
                    <Coins size={12} className="text-[var(--color-tenno-cyan)]" />
                    {t('foundry.buildPrice')}
                  </span>
                  <span className="text-[#9fdcff]">{(selected.buildPrice ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#8fa3b8]">
                    <Clock size={12} className="text-[var(--color-tenno-cyan)]" />
                    {t('foundry.buildTime')}
                  </span>
                  <span className="text-[#9fdcff]">
                    {formatBuildTime(selected.buildTime ?? 0, timeLabels)}
                  </span>
                </div>
                {Boolean(selected.skipBuildTimePrice) && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#8fa3b8]">
                      <Gem size={12} className="text-[var(--color-tenno-gold)]" />
                      {t('foundry.skipBuildTimePrice')}
                    </span>
                    <span className="text-[var(--color-tenno-gold)]">{selected.skipBuildTimePrice}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-1 font-mono text-[11px] tracking-[2px] text-[#4a5d72] uppercase">
                  {t('foundry.components')}
                </p>
                <div className="flex flex-col">
                  {(selected.components ?? []).map((component) => (
                    <ComponentRow key={component.uniqueName} component={component} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-[#5c7185]">{t('foundry.selectItem')}</p>
          )}
        </Panel>
      </div>
    </div>
  )
}

export default FoundryPage
