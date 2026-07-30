import { test, expect, _electron as electron } from '@playwright/test'
import { join } from 'path'

// TDD 7.4: haqiqiy paketlangan dasturni ishga tushirib, Main<->Renderer IPC
// oqimini (schema version + master data) end-to-end tekshiradi.
test('ilova ishga tushadi, master data va schema versiyasini yuklaydi', async () => {
  const app = await electron.launch({ args: [join(__dirname, '../../out/main/index.js')] })
  const window = await app.firstWindow()

  await window.waitForSelector('text=MY TENNO', { timeout: 15000 })

  const schemaVersion = await window.evaluate(() => (window as unknown as { api: { getSchemaVersion(): Promise<number> } }).api.getSchemaVersion())
  expect(schemaVersion).toBeGreaterThanOrEqual(1)

  const masterData = await window.evaluate(() =>
    (window as unknown as { api: { getMasterData(): Promise<{ items: unknown[] }> } }).api.getMasterData()
  )
  expect(masterData.items.length).toBeGreaterThan(0)

  await app.close()
})
