import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import https from 'https'
import { createHash } from 'crypto'
import Items from 'warframe-items'
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
  'Pets',
  'Quests'
]

// `warframe-items` npm paketi 2025-04'dan beri chop etilmagan (WFCD'ning
// npm publish pipeline'i buzilgan), garchi GitHub repo'sining o'zi har kuni
// yangilanib turgan bo'lsa ham (tekshirilgan: 2026-07-30'da ~28 ta qurol va
// ~11 ta Warframe npm paketida yo'q edi). Shu sababli ma'lumot to'g'ridan-
// to'g'ri GitHub'ning `data/json/` xom fayllaridan olinadi - mahalliy
// keshlanadi (24 soat TTL), fonda yangilanadi. Agar internet umuman yo'q
// bo'lsa (birinchi ishga tushirish), bundle qilingan npm paket ma'lumoti
// (eski, lekin ishlaydigan) zaxira sifatida ishlatiladi.
const RAW_BASE = 'https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/'
const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 soat

interface CacheFile {
  fetchedAt: number
  dataVersion: string
  items: WarframeItem[]
}

let cacheFilePath: string | null = null
let cachedPayload: MasterDataPayload | null = null
let readyPromise: Promise<void> | null = null

function getCacheFilePath(): string {
  if (cacheFilePath) return cacheFilePath

  const dir = app.getPath('userData')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  cacheFilePath = join(dir, 'masterDataCache.json')
  return cacheFilePath
}

function loadCacheFromDisk(): CacheFile | null {
  const path = getCacheFilePath()
  if (!existsSync(path)) return null

  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as CacheFile
  } catch {
    return null
  }
}

function fetchJson(url: string, redirectsLeft = 5): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const request = https
      .get(url, { timeout: 20_000 }, (res) => {
        const status = res.statusCode ?? 0

        if (status >= 300 && status < 400 && res.headers.location && redirectsLeft > 0) {
          res.resume()
          fetchJson(res.headers.location, redirectsLeft - 1).then(resolve, reject)
          return
        }

        if (status >= 400) {
          res.resume()
          reject(new Error(`HTTP ${status} for ${url}`))
          return
        }

        const chunks: Buffer[] = []
        res.on('data', (chunk: Buffer) => chunks.push(chunk))
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8')))
          } catch (error) {
            reject(error)
          }
        })
        res.on('error', reject)
      })
      .on('error', reject)
    request.on('timeout', () => request.destroy(new Error(`Timeout fetching ${url}`)))
  })
}

function computeDataVersion(items: WarframeItem[]): string {
  const fingerprint = items.map((item) => item.uniqueName).join('|')
  return createHash('sha1').update(fingerprint).digest('hex').slice(0, 12)
}

async function fetchFromGitHub(): Promise<WarframeItem[]> {
  const results = await Promise.all(
    CATEGORIES.map((category) => fetchJson(`${RAW_BASE}${encodeURIComponent(category)}.json`))
  )
  return results.flat() as WarframeItem[]
}

function loadFromBundledPackage(): WarframeItem[] {
  const options = { category: CATEGORIES } as ConstructorParameters<typeof Items>[0]
  const instance = new Items(options) as unknown as WarframeItem[]
  return Array.from(instance)
}

async function fetchAndCache(): Promise<void> {
  const items = await fetchFromGitHub()
  const dataVersion = computeDataVersion(items)
  cachedPayload = { dataVersion, items }
  writeFileSync(getCacheFilePath(), JSON.stringify({ fetchedAt: Date.now(), dataVersion, items }))
}

function ensureReady(): Promise<void> {
  if (readyPromise) return readyPromise

  readyPromise = (async () => {
    const cached = loadCacheFromDisk()
    if (cached) {
      cachedPayload = { dataVersion: cached.dataVersion, items: cached.items }
      if (Date.now() - cached.fetchedAt < REFRESH_INTERVAL_MS) return
      void fetchAndCache().catch(() => {
        // Internet yo'q yoki GitHub javob bermadi - eski kesh davom etadi.
      })
      return
    }

    // Kesh umuman yo'q (birinchi ishga tushirish) - GitHub'dan olishga
    // harakat qilinadi, muvaffaqiyatsiz bo'lsa bundle qilingan (eski)
    // npm paket ma'lumotiga qaytiladi.
    try {
      await fetchAndCache()
    } catch {
      const items = loadFromBundledPackage()
      cachedPayload = { dataVersion: computeDataVersion(items), items }
    }
  })()

  return readyPromise
}

export async function getMasterData(): Promise<MasterDataPayload> {
  await ensureReady()
  return cachedPayload as MasterDataPayload
}
