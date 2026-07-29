import { defineConfig } from 'vitest/config'

// TDD 7.4: Vitest - Zustand store logikasi va ma'lumot transformatsiya
// funksiyalari (better-sqlite3'ga bog'liq bo'lmagan pure kod) uchun.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts']
  }
})
