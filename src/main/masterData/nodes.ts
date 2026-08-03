import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import https from 'https'
import Items from 'warframe-items'

export interface MissionNode {
  uniqueName: string
  name: string
  systemName: string
  masteryReq?: number
  minEnemyLevel?: number
  maxEnemyLevel?: number
  type?: string
  faction?: string
}

// TDD 5.3: Mission Tracker uchun star chart node'lari - Arsenal'ning
// qurol/frame ro'yxatidan alohida, faqat shu maqsad uchun yuklanadi.
// masterData/index.ts'dagi kabi: `warframe-items` npm paketi eskirgan
// (2025-04'dan beri chop etilmagan), shuning uchun GitHub'ning xom
// `data/json/Node.json` faylidan to'g'ridan-to'g'ri olinadi, mahalliy
// keshlanadi (24 soat), internet yo'q bo'lsa bundle qilingan paketga
// zaxira sifatida qaytiladi.
const RAW_URL = 'https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Node.json'
// Node.json'da missiya turi/faksiya faqat raqamli kod (nodeType) sifatida bor,
// ishonchli oshkor jadval topilmadi. warframe-worldstate-parser'ning
// solNodes.json'i xuddi shu uniqueName bo'yicha kalitlangan va bu maydonlarni
// allaqachon o'qiladigan matn ko'rinishida beradi (masalan "Spy"/"Grineer").
const SOL_NODES_URL = 'https://raw.githubusercontent.com/WFCD/warframe-worldstate-data/master/data/solNodes.json'
const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000

interface CacheFile {
  fetchedAt: number
  nodes: MissionNode[]
}

let cacheFilePath: string | null = null
let cachedNodes: MissionNode[] | null = null
let readyPromise: Promise<void> | null = null

function getCacheFilePath(): string {
  if (cacheFilePath) return cacheFilePath

  const dir = app.getPath('userData')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  cacheFilePath = join(dir, 'nodesCache.json')
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

interface RawNode {
  uniqueName: string
  name: string
  systemName: string
  masteryReq?: number
  minEnemyLevel?: number
  maxEnemyLevel?: number
}

interface SolNodeInfo {
  type?: string
  enemy?: string
}

function toNode(raw: RawNode, solInfo?: SolNodeInfo): MissionNode {
  return {
    uniqueName: raw.uniqueName,
    name: raw.name,
    systemName: raw.systemName,
    masteryReq: raw.masteryReq,
    minEnemyLevel: raw.minEnemyLevel,
    maxEnemyLevel: raw.maxEnemyLevel,
    type: solInfo?.type,
    faction: solInfo?.enemy
  }
}

function loadFromBundledPackage(): MissionNode[] {
  const options = { category: ['Node'] } as ConstructorParameters<typeof Items>[0]
  const instance = new Items(options) as unknown as RawNode[]
  // Offline zaxira - solNodes.json tarmoqdan kelmagani uchun type/faction bo'sh qoladi.
  return instance.map((raw) => toNode(raw))
}

async function fetchSolNodeInfo(): Promise<Record<string, SolNodeInfo>> {
  try {
    return (await fetchJson(SOL_NODES_URL)) as Record<string, SolNodeInfo>
  } catch {
    return {}
  }
}

async function fetchAndCache(): Promise<void> {
  const [raw, solNodes] = await Promise.all([
    fetchJson(RAW_URL) as Promise<RawNode[]>,
    fetchSolNodeInfo()
  ])
  const nodes = raw.map((r) => toNode(r, solNodes[r.uniqueName]))
  cachedNodes = nodes
  writeFileSync(getCacheFilePath(), JSON.stringify({ fetchedAt: Date.now(), nodes }))
}

function ensureReady(): Promise<void> {
  if (readyPromise) return readyPromise

  readyPromise = (async () => {
    const cached = loadCacheFromDisk()
    if (cached) {
      cachedNodes = cached.nodes
      if (Date.now() - cached.fetchedAt < REFRESH_INTERVAL_MS) return
      void fetchAndCache().catch(() => {
        // Internet yo'q yoki GitHub javob bermadi - eski kesh davom etadi.
      })
      return
    }

    try {
      await fetchAndCache()
    } catch {
      cachedNodes = loadFromBundledPackage()
    }
  })()

  return readyPromise
}

export async function getNodes(): Promise<MissionNode[]> {
  await ensureReady()
  return cachedNodes as MissionNode[]
}
