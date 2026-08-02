import { app, shell, BrowserWindow, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerIpcHandlers } from './ipc'
import { closeDb } from './db'
import { logError } from './logger'
import { initAutoUpdater } from './updater'
import { warmImageNameMap } from './imageNameMap'

// AppData/Roaming/TennoLog/ ostida saqlash uchun (TDD 4.2) - npm paket nomidan
// mustaqil, dev va build rejimlarida bir xil papka ishlatilishi uchun aniq
// belgilanadi.
app.setName('TennoLog')

// TDD 7.3: kutilmagan xatolar ilovani "qotirmasligi" kerak - shu yerda
// ushlanib, lokal log fayliga yoziladi.
process.on('uncaughtException', (error) => logError('uncaughtException', error))
process.on('unhandledRejection', (error) => logError('unhandledRejection', error))

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1125,
    height: 840,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      // UI umumiy elementlari (matn, ikonka, bo'shliqlar) kichik ekranlarda
      // o'qilishi qiyin edi - butun sahifani Chromium darajasida kattalashtiramiz
      // (komponentlarni birma-bir o'zgartirishdan ko'ra ishonchliroq, chunki
      // rem-asoslangan va qattiq px qiymatlar birga masshtablanadi).
      zoomFactor: 1.25
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // TDD 7.1: qattiq Content-Security-Policy - faqat 'self' manbadan
  // skript/style, unsafe-inline/unsafe-eval yo'q. Dev rejimida Vite HMR va
  // React Refresh ichki (inline) skript qo'shgani uchun unsafe-inline/eval
  // faqat is.dev bo'lganda yumshatiladi - production build'da qo'llanmaydi.
  // img-src'ga 'data:' qo'shilgan - qurol rasmlari main process'da CDN'dan
  // yuklanib, base64 data URI sifatida uzatiladi (masterData/imageCache.ts).
  const csp = is.dev
    ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"
    : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    })
  })

  registerIpcHandlers()

  // Qurol rasmlari uchun to'g'ri CDN nomlarini fonda yangilaydi - ilova
  // ishga tushishini kutmaydi, xato bo'lsa ham jim o'tadi (imageNameMap.ts).
  warmImageNameMap()

  const mainWindow = createWindow()

  // TDD 8: auto-update tekshiruvi faqat production build'da, dev'da
  // update-server/paketlangan artefakt bo'lmagani uchun o'chirilgan.
  if (!is.dev) {
    initAutoUpdater(mainWindow)
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  closeDb()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
