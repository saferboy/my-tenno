import { useEffect, useState } from 'react'
import type { UpdaterEvent } from '../../../main/updater'
import { useT } from '../i18n/useT'

// TDD 8: yangi versiya borligini ko'rsatuvchi banner - foydalanuvchi
// ruxsatisiz hech narsa yuklanmaydi/o'rnatilmaydi.
function UpdateBanner(): React.JSX.Element | null {
  const [state, setState] = useState<UpdaterEvent | null>(null)
  const [downloading, setDownloading] = useState(false)
  const t = useT()

  useEffect(() => {
    return window.api.onUpdaterEvent(setState)
  }, [])

  if (!state) return null

  async function handleDownload(): Promise<void> {
    setDownloading(true)
    await window.api.downloadUpdate()
  }

  return (
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-[var(--color-tenno-gold)]/40 bg-[var(--color-void-base)] px-4 py-2 text-sm shadow-2xl">
      {state.type === 'available' && (
        <span>
          {t('update.available', { version: state.version })}{' '}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="text-[var(--color-tenno-gold)] underline disabled:opacity-50"
          >
            {downloading ? t('update.downloading') : t('update.download')}
          </button>
        </span>
      )}
      {state.type === 'downloaded' && (
        <span>
          {t('update.downloaded')}{' '}
          <button
            type="button"
            onClick={() => window.api.installUpdate()}
            className="text-[var(--color-tenno-gold)] underline"
          >
            {t('update.installRestart')}
          </button>
        </span>
      )}
    </div>
  )
}

export default UpdateBanner
