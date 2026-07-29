import { autoUpdater } from 'electron-updater'
import type { BrowserWindow } from 'electron'
import { logError } from './logger'

export type UpdaterEvent = { type: 'available'; version: string } | { type: 'downloaded' }

// TDD 8: electron-updater + GitHub Releases orqali avtomatik yangilanish.
// Faqat production build'da chaqiriladi (main/index.ts'da is.dev bilan
// tekshiriladi); foydalanuvchi ruxsati bilan yuklanadi (autoDownload: false).
export function initAutoUpdater(mainWindow: BrowserWindow): void {
  autoUpdater.autoDownload = false

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('updater:event', { type: 'available', version: info.version } satisfies UpdaterEvent)
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('updater:event', { type: 'downloaded' } satisfies UpdaterEvent)
  })

  autoUpdater.on('error', (error) => {
    logError('autoUpdater', error)
  })

  autoUpdater.checkForUpdates().catch((error) => logError('autoUpdater:check', error))
}

export function downloadUpdate(): Promise<void> {
  return autoUpdater.downloadUpdate().then(() => undefined)
}

export function installUpdate(): void {
  autoUpdater.quitAndInstall()
}
