import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import https from 'https'

const LIVE_API_URL = 'https://api.warframestat.us/items?only=uniqueName,imageName'
const REFRESH_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000 // 7 kun

interface CacheFile {
  fetchedAt: number
  map: Record<string, string>
}

let cacheFilePath: string | null = null
let map: Record<string, string> | null = null
let mapReadyPromise: Promise<void> | null = null

function getCacheFilePath(): string {
  if (cacheFilePath) return cacheFilePath

  const dir = join(app.getPath('userData'), 'imageCache')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  cacheFilePath = join(dir, 'imageNameMap.json')
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

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const status = res.statusCode ?? 0
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
  })
}

async function fetchAndCacheMap(): Promise<void> {
  try {
    const items = (await fetchJson(LIVE_API_URL)) as Array<{
      uniqueName?: string
      imageName?: string
    }>

    const fresh: Record<string, string> = {}
    for (const item of items) {
      if (item.uniqueName && item.imageName) {
        fresh[item.uniqueName] = item.imageName
      }
    }

    map = fresh
    writeFileSync(getCacheFilePath(), JSON.stringify({ fetchedAt: Date.now(), map: fresh }))
  } catch {
    // Tarmoq yo'q yoki API javob bermadi - eski kesh (agar bo'lsa) yoki
    // xarita umuman yo'qligi davom etadi, chaqiruvchi eski nomga qaytadi.
  }
}

// api.warframestat.us (jonli API) - npm'ga bundle qilingan warframe-items'dan
// farqli o'laroq - imageName maydonini hozirgi CDN fayl nomlariga mos holda
// yangilab turadi. Diskdagi kesh bo'lsa darhol ishlatiladi (7 kundan eski
// bo'lsa fonda, bloklamasdan yangilanadi); kesh umuman yo'q bo'lsa (birinchi
// ishga tushirish) - birinchi rasm so'rovi tarmoq javobini kutib turadi,
// aks holda o'sha item'lar shu sessiya davomida "topilmadi" deb qolib ketardi.
function ensureMapReady(): Promise<void> {
  if (mapReadyPromise) return mapReadyPromise

  mapReadyPromise = (async () => {
    const cached = loadCacheFromDisk()
    if (cached) {
      map = cached.map
      if (Date.now() - cached.fetchedAt < REFRESH_INTERVAL_MS) return
      void fetchAndCacheMap() // eskirgan - fonda yangilanadi, kutish shart emas
      return
    }

    await fetchAndCacheMap() // kesh umuman yo'q - birinchi safar kutish kerak
  })()

  return mapReadyPromise
}

export async function getCorrectedImageName(
  uniqueName: string,
  fallbackImageName: string | undefined
): Promise<string | undefined> {
  await ensureMapReady()
  return map?.[uniqueName] ?? fallbackImageName
}

export function warmImageNameMap(): void {
  void ensureMapReady()
}
