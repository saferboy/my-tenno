import { useEffect, useState } from 'react'
import type { UpdaterEvent } from '../../../main/updater'

// TDD 8: yangi versiya borligini ko'rsatuvchi banner - foydalanuvchi
// ruxsatisiz hech narsa yuklanmaydi/o'rnatilmaydi.
function UpdateBanner(): React.JSX.Element | null {
  const [state, setState] = useState<UpdaterEvent | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    return window.api.onUpdaterEvent(setState)
  }, [])

  if (!state) return null

  async function handleDownload(): Promise<void> {
    setDownloading(true)
    await window.api.downloadUpdate()
  }

  return (
    <div className="chamfer fixed top-4 left-1/2 z-50 -translate-x-1/2 border border-[var(--orokin-gold)] bg-[var(--orokin-panel)] px-4 py-2 text-sm">
      {state.type === 'available' && (
        <span>
          Yangi versiya mavjud ({state.version}).{' '}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="text-[var(--orokin-gold)] underline disabled:opacity-50"
          >
            {downloading ? 'Yuklanmoqda...' : 'Yuklab olish'}
          </button>
        </span>
      )}
      {state.type === 'downloaded' && (
        <span>
          Yangilanish yuklandi.{' '}
          <button
            type="button"
            onClick={() => window.api.installUpdate()}
            className="text-[var(--orokin-gold)] underline"
          >
            O&apos;rnatish va qayta ishga tushirish
          </button>
        </span>
      )}
    </div>
  )
}

export default UpdateBanner
