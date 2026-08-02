import { gzipSync, gunzipSync } from 'zlib'

export interface SharePayload {
  exportedAt: string
  itemStatuses: unknown[]
  missionStatuses: unknown[]
}

function isSharePayload(value: unknown): value is SharePayload {
  if (!value || typeof value !== 'object') return false
  const payload = value as Record<string, unknown>
  return (
    typeof payload.exportedAt === 'string' &&
    Array.isArray(payload.itemStatuses) &&
    Array.isArray(payload.missionStatuses)
  )
}

// TDD 5.8: Profile Export/Import "Share Code" - progress ma'lumotini siqilgan
// base64 kodga aylantiradi. DB'ga bog'liq emas (pure funksiya) - Vitest bilan
// to'g'ridan-to'g'ri sinaladi.
export function encodeShareCode(payload: SharePayload): string {
  const json = JSON.stringify(payload)
  const compressed = gzipSync(Buffer.from(json, 'utf-8'))
  return compressed.toString('base64')
}

export function decodeShareCode(code: string): SharePayload {
  let payload: unknown
  try {
    const buffer = Buffer.from(code.trim(), 'base64')
    const decompressed = gunzipSync(buffer)
    payload = JSON.parse(decompressed.toString('utf-8'))
  } catch {
    throw new Error('ERR_SHARE_CODE_INVALID')
  }

  if (!isSharePayload(payload)) {
    throw new Error('ERR_SHARE_CODE_INVALID')
  }

  return payload
}
