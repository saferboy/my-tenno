import { defineConfig } from '@playwright/test'

// TDD 7.4: Playwright (Electron mode) - Main/Renderer IPC oqimini haqiqiy
// paketlangan (out/) dastur ustida end-to-end tekshirish uchun.
// Ishga tushirishdan oldin `npm run build` bajarilgan bo'lishi kerak.
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  workers: 1,
  reporter: 'list'
})
