import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import https from 'https'
import { getCorrectedImageName } from './imageNameMap'

const CDN_BASE = 'https://cdn.warframestat.us/img/'
const SAFE_IMAGE_NAME = /^[a-zA-Z0-9._-]+$/

let cacheDir: string | null = null

function getCacheDir(): string {
  if (cacheDir) return cacheDir

  const dir = join(app.getPath('userData'), 'imageCache')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  cacheDir = dir
  return cacheDir
}

function mimeFor(imageName: string): string {
  if (imageName.endsWith('.jpg') || imageName.endsWith('.jpeg')) return 'image/jpeg'
  if (imageName.endsWith('.webp')) return 'image/webp'
  return 'image/png'
}

const MAX_REDIRECTS = 5

// WFCD'ning cdn.warframestat.us manzili haqiqiy faylga (GitHub raw content)
// 301 redirect orqali yo'naltiradi - shuni qo'lda kuzatib borish kerak.
function fetchBuffer(url: string, redirectsLeft = MAX_REDIRECTS): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const status = res.statusCode ?? 0

        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume()
          if (redirectsLeft <= 0) {
            reject(new Error(`Too many redirects for ${url}`))
            return
          }
          resolve(fetchBuffer(res.headers.location, redirectsLeft - 1))
          return
        }

        if (status >= 400) {
          reject(new Error(`HTTP ${status} for ${url}`))
          return
        }

        const chunks: Buffer[] = []
        res.on('data', (chunk: Buffer) => chunks.push(chunk))
        res.on('end', () => resolve(Buffer.concat(chunks)))
        res.on('error', reject)
      })
      .on('error', reject)
  })
}

// TDD 5.2: qurol rasmlari warframe-items npm paketida bundle qilinmagan
// (WFCD alohida CDN orqali beradi) - shu sababli birinchi ko'rilganda
// tarmoqdan yuklanadi va AppData/Roaming/TennoLog/imageCache/ ichida
// keshlanadi, keyingi safar internetsiz ham ko'rsatiladi.
//
// npm paketining `imageName` maydoni eskirgan (hash-asosidagi) nomlarni
// saqlaydi va CDN'da doimiy 404 qaytaradi (WFCD issue #636 regressiyasi) -
// shu sababli avval imageNameMap orqali jonli API'dan olingan to'g'ri nom
// bilan almashtirishga harakat qilinadi, topilmasa eski nomga qaytiladi.
export async function getItemImage(
  uniqueName: string,
  fallbackImageName: string | undefined
): Promise<string | null> {
  const imageName = await getCorrectedImageName(uniqueName, fallbackImageName)
  if (!imageName || !SAFE_IMAGE_NAME.test(imageName)) return null

  const cachePath = join(getCacheDir(), imageName)
  const mime = mimeFor(imageName)

  if (existsSync(cachePath)) {
    const buffer = readFileSync(cachePath)
    return `data:${mime};base64,${buffer.toString('base64')}`
  }

  try {
    const buffer = await fetchBuffer(`${CDN_BASE}${imageName}`)
    writeFileSync(cachePath, buffer)
    return `data:${mime};base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}
