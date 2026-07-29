import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let overlayWindow: BrowserWindow | null = null

export function isOverlayOpen(): boolean {
  return overlayWindow !== null && !overlayWindow.isDestroyed()
}

// TDD 5.7: Mini Overlay - o'yin ustida doim yuqorida turuvchi kichik widget,
// asosiy oynadan mustaqil ravishda yoqilib/o'chirilishi mumkin.
export function toggleOverlay(): boolean {
  if (isOverlayOpen()) {
    overlayWindow?.close()
    overlayWindow = null
    return false
  }

  const { width } = screen.getPrimaryDisplay().workAreaSize
  overlayWindow = new BrowserWindow({
    width: 320,
    height: 360,
    x: width - 340,
    y: 20,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    overlayWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?view=overlay`)
  } else {
    overlayWindow.loadFile(join(__dirname, '../renderer/index.html'), { search: 'view=overlay' })
  }

  overlayWindow.on('closed', () => {
    overlayWindow = null
  })

  return true
}
