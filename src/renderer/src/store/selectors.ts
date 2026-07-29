import type Fuse from 'fuse.js'
import type { WarframeItem } from '../../../main/masterData/types'
import type { ItemStatus } from '../../../main/db/types'
import type { StatusFilter } from './useAppStore'

interface FilterArgs {
  items: WarframeItem[]
  fuse: Fuse<WarframeItem> | null
  searchQuery: string
  categoryFilter: string | null
  statusFilter: StatusFilter
  statusByItem: Record<string, ItemStatus>
}

export function filterItems(args: FilterArgs): WarframeItem[] {
  const { items, fuse, searchQuery, categoryFilter, statusFilter, statusByItem } = args

  let result = searchQuery.trim() && fuse ? fuse.search(searchQuery.trim()).map((r) => r.item) : items

  if (categoryFilter) {
    result = result.filter((item) => item.category === categoryFilter)
  }

  if (statusFilter !== 'all') {
    result = result.filter((item) => {
      const status = statusByItem[item.uniqueName]
      if (statusFilter === 'owned') return Boolean(status?.owned)
      if (statusFilter === 'maxed') return Boolean(status?.maxed)
      return !status?.owned
    })
  }

  return result
}
