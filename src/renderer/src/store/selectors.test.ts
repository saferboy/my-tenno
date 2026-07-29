import { describe, expect, it } from 'vitest'
import Fuse from 'fuse.js'
import { filterItems } from './selectors'
import type { WarframeItem } from '../../../main/masterData/types'
import type { ItemStatus } from '../../../main/db/types'

describe('filterItems', () => {
  const items: WarframeItem[] = [
    { uniqueName: '/a', name: 'Braton', category: 'Primary' },
    { uniqueName: '/b', name: 'Lex', category: 'Secondary' },
    { uniqueName: '/c', name: 'Excalibur', category: 'Warframes' }
  ]
  const fuse = new Fuse(items, { keys: ['name', 'category'], threshold: 0.3 })

  it('returns all items when no filters are active', () => {
    const result = filterItems({
      items,
      fuse,
      searchQuery: '',
      categoryFilter: null,
      statusFilter: 'all',
      statusByItem: {}
    })
    expect(result).toHaveLength(3)
  })

  it('filters by category', () => {
    const result = filterItems({
      items,
      fuse,
      searchQuery: '',
      categoryFilter: 'Primary',
      statusFilter: 'all',
      statusByItem: {}
    })
    expect(result.map((i) => i.uniqueName)).toEqual(['/a'])
  })

  it('filters by fuzzy search query', () => {
    const result = filterItems({
      items,
      fuse,
      searchQuery: 'Excalib',
      categoryFilter: null,
      statusFilter: 'all',
      statusByItem: {}
    })
    expect(result.map((i) => i.uniqueName)).toContain('/c')
  })

  it('filters by owned status', () => {
    const statusByItem: Record<string, ItemStatus> = {
      '/a': { itemUniqueName: '/a', owned: true, maxed: false, sold: false, rank: null, notes: null, updatedAt: '' }
    }
    const result = filterItems({
      items,
      fuse,
      searchQuery: '',
      categoryFilter: null,
      statusFilter: 'owned',
      statusByItem
    })
    expect(result.map((i) => i.uniqueName)).toEqual(['/a'])
  })

  it('filters by not-owned status', () => {
    const statusByItem: Record<string, ItemStatus> = {
      '/a': { itemUniqueName: '/a', owned: true, maxed: false, sold: false, rank: null, notes: null, updatedAt: '' }
    }
    const result = filterItems({
      items,
      fuse,
      searchQuery: '',
      categoryFilter: null,
      statusFilter: 'not-owned',
      statusByItem
    })
    expect(result.map((i) => i.uniqueName)).toEqual(['/b', '/c'])
  })
})
