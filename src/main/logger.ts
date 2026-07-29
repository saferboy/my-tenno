import { app } from 'electron'
import { appendFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// TDD 7.3: kritik xatolar lokal log faylga yoziladi (internetga hech narsa
// yuborilmaydi), foydalanuvchiga esa alohida Error Modal/toast ko'rsatiladi.
export function logError(context: string, error: unknown): void {
  try {
    const logDir = join(app.getPath('userData'), 'logs')
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true })
    }

    const message = error instanceof Error ? (error.stack ?? error.message) : String(error)
    const line = `[${new Date().toISOString()}] ${context}: ${message}\n`
    appendFileSync(join(logDir, 'error.log'), line)
  } catch {
    // Log yozishning o'zi muvaffaqiyatsiz bo'lsa, dasturni to'xtatmaymiz.
  }
}
