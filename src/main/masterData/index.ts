import Items from 'warframe-items'
import { createHash } from 'crypto'
import type { MasterDataPayload, WarframeItem } from './types'

// TDD 4.1: Arsenal uchun kerakli asosiy kategoriyalar (V1 doirasida).
const CATEGORIES = [
  'Warframes',
  'Primary',
  'Secondary',
  'Melee',
  'Archwing',
  'Arch-Gun',
  'Arch-Melee',
  'Sentinels',
  'SentinelWeapons',
  'Pets'
]

let cached: MasterDataPayload | null = null

// TDD 4.1.1: dataVersion - warframe-items eksport hashlaridan hisoblanadi,
// yangi patch bilan JSON yangilanganda avtomatik o'zgaradi.
function computeDataVersion(versions: unknown): string {
  return createHash('sha1').update(JSON.stringify(versions)).digest('hex').slice(0, 12)
}

export function getMasterData(): MasterDataPayload {
  if (cached) return cached

  const options = { category: CATEGORIES } as ConstructorParameters<typeof Items>[0]
  const instance = new Items(options) as unknown as { versions: unknown } & WarframeItem[]

  cached = {
    dataVersion: computeDataVersion(instance.versions),
    items: Array.from(instance) as WarframeItem[]
  }

  return cached
}
