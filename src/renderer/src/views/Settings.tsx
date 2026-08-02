import { useCallback, useEffect, useState } from 'react'
import type { BackupInfo } from '../../../main/db/backup'
import type { Locale } from '../../../main/db/types'
import type { SharePayload } from '../../../main/shareCode'
import { useAppStore } from '../store/useAppStore'
import { useMissionStore } from '../store/useMissionStore'
import { useToastStore } from '../store/useToastStore'
import { useUserProfileStore } from '../store/useUserProfileStore'
import { useT } from '../i18n/useT'
import { LOCALES } from '../i18n/translations'
import { describeError } from '../i18n/errorMessage'

// TDD 7.2: "Export Backup" / "Restore from Backup" - qo'lda backup boshqaruvi.
function Settings(): React.JSX.Element {
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [shareCode, setShareCode] = useState('')
  const [importCode, setImportCode] = useState('')
  const [importedPreview, setImportedPreview] = useState<SharePayload | null>(null)
  const reloadItems = useAppStore((s) => s.init)
  const reloadMissions = useMissionStore((s) => s.init)
  const showToast = useToastStore((s) => s.show)
  const locale = useUserProfileStore((s) => s.locale)
  const setLocale = useUserProfileStore((s) => s.setLocale)
  const t = useT()

  async function handleGenerateShareCode(): Promise<void> {
    try {
      setShareCode(await window.api.generateShareCode())
    } catch (error) {
      showToast(describeError(error))
    }
  }

  async function handleCopyShareCode(): Promise<void> {
    if (!shareCode) return
    await navigator.clipboard.writeText(shareCode)
    showToast(t('settings.share.copied'))
  }

  async function handleImportShareCode(): Promise<void> {
    try {
      setImportedPreview(await window.api.parseShareCode(importCode))
    } catch (error) {
      showToast(describeError(error))
    }
  }

  async function handleToggleOverlay(): Promise<void> {
    try {
      setOverlayOpen(await window.api.toggleOverlay())
    } catch (error) {
      showToast(describeError(error))
    }
  }

  const refreshBackups = useCallback(async () => {
    try {
      setBackups(await window.api.listBackups())
    } catch (error) {
      showToast(describeError(error))
    }
  }, [showToast])

  useEffect(() => {
    window.api.listBackups().then(setBackups, (error) => {
      showToast(describeError(error))
    })
  }, [showToast])

  async function handleCreateBackup(): Promise<void> {
    try {
      const info = await window.api.createBackup()
      showToast(
        info
          ? t('settings.backup.created', { fileName: info.fileName })
          : t('settings.backup.notNeeded')
      )
      await refreshBackups()
    } catch (error) {
      showToast(describeError(error))
    }
  }

  async function handleRestore(fileName: string): Promise<void> {
    const confirmed = window.confirm(t('settings.backup.restoreConfirm', { fileName }))
    if (!confirmed) return

    try {
      await window.api.restoreBackup(fileName)
      showToast(t('settings.backup.restored'))
      await Promise.all([reloadItems(), reloadMissions(), refreshBackups()])
    } catch (error) {
      showToast(describeError(error))
    }
  }

  async function handleExportJson(): Promise<void> {
    try {
      const result = await window.api.exportJson()
      showToast(
        result.saved
          ? t('settings.export.done', { filePath: result.filePath ?? '' })
          : t('settings.export.cancelled')
      )
    } catch (error) {
      showToast(describeError(error))
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
      <h1 className="font-display text-xl font-extrabold tracking-wide text-[var(--color-tenno-gold)] uppercase">
        {t('settings.title')}
      </h1>

      <div className="surface-base flex flex-wrap items-center gap-3 rounded-lg p-4">
        <p className="font-mono text-[10px] tracking-widest text-[var(--color-t3)] uppercase">
          {t('settings.language')}
        </p>
        <div className="flex gap-1">
          {LOCALES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLocale(option.value as Locale)}
              className={`rounded-md px-3 py-2 text-sm ${
                locale === option.value
                  ? 'bg-[var(--color-tenno-gold)] text-black'
                  : 'border border-[var(--color-void-border)] text-[var(--color-t2)] hover:text-[var(--color-t1)]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="surface-base flex flex-wrap items-center gap-3 rounded-lg p-4">
        <p className="font-mono text-[10px] tracking-widest text-[var(--color-t3)] uppercase">
          {t('settings.overlay.label')}
        </p>
        <button
          type="button"
          onClick={handleToggleOverlay}
          className="rounded-md border border-[var(--color-void-border)] px-4 py-2 text-sm text-[var(--color-t2)] hover:text-[var(--color-t1)]"
        >
          {overlayOpen ? t('settings.overlay.on') : t('settings.overlay.off')}
        </button>
      </div>

      <div className="surface-base flex flex-wrap gap-3 rounded-lg p-4">
        <button
          type="button"
          onClick={handleCreateBackup}
          className="rounded-md bg-[var(--color-tenno-gold)] px-4 py-2 text-sm font-semibold text-black"
        >
          {t('settings.backup.create')}
        </button>
        <button
          type="button"
          onClick={handleExportJson}
          className="rounded-md border border-[var(--color-void-border)] px-4 py-2 text-sm text-[var(--color-t2)] hover:text-[var(--color-t1)]"
        >
          {t('settings.backup.exportJson')}
        </button>
      </div>

      <div className="surface-base rounded-lg p-4">
        <p className="mb-2 font-mono text-[10px] tracking-widest text-[var(--color-t3)] uppercase">
          {t('settings.backup.listTitle')}
        </p>
        {backups.length === 0 && (
          <p className="text-sm text-[var(--color-t2)]">{t('settings.backup.empty')}</p>
        )}
        <ul className="space-y-1">
          {backups.map((backup) => (
            <li
              key={backup.fileName}
              className="flex items-center justify-between border-b border-[var(--color-void-border)] py-2 text-sm"
            >
              <span>
                {backup.fileName}
                <span className="ml-2 text-[var(--color-t2)]">
                  {new Date(backup.createdAt).toLocaleString()}
                </span>
              </span>
              <button
                type="button"
                onClick={() => handleRestore(backup.fileName)}
                className="rounded border border-[var(--color-void-border)] px-3 py-1 text-xs uppercase text-[var(--color-tenno-cyan)] hover:bg-[var(--color-void-border)]"
              >
                {t('settings.backup.restore')}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="surface-base rounded-lg p-4">
        <p className="mb-2 font-mono text-[10px] tracking-widest text-[var(--color-t3)] uppercase">
          {t('settings.share.title')}
        </p>

        <div className="mb-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleGenerateShareCode}
            className="self-start rounded-md bg-[var(--color-tenno-gold)] px-4 py-2 text-sm font-semibold text-black"
          >
            {t('settings.share.generate')}
          </button>
          {shareCode && (
            <div className="flex flex-col gap-2">
              <textarea
                readOnly
                value={shareCode}
                className="h-24 rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-black)] px-2 py-1 text-xs"
              />
              <button
                type="button"
                onClick={handleCopyShareCode}
                className="self-start rounded border border-[var(--color-void-border)] px-3 py-1 text-xs uppercase text-[var(--color-tenno-cyan)] hover:bg-[var(--color-void-border)]"
              >
                {t('settings.share.copy')}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <textarea
            placeholder={t('settings.share.importPlaceholder')}
            value={importCode}
            onChange={(e) => setImportCode(e.target.value)}
            className="h-24 rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-black)] px-2 py-1 text-xs"
          />
          <button
            type="button"
            onClick={handleImportShareCode}
            className="self-start rounded border border-[var(--color-void-border)] px-3 py-1 text-xs uppercase text-[var(--color-tenno-cyan)] hover:bg-[var(--color-void-border)]"
          >
            {t('settings.share.import')}
          </button>
          {importedPreview && (
            <div className="rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-black)] p-3 text-xs">
              <p>
                {t('settings.share.exportedAt', {
                  date: new Date(importedPreview.exportedAt).toLocaleString()
                })}
              </p>
              <p>
                {t('settings.share.itemRecords', { count: importedPreview.itemStatuses.length })}
              </p>
              <p>
                {t('settings.share.missionRecords', {
                  count: importedPreview.missionStatuses.length
                })}
              </p>
              <p className="mt-1 text-[var(--color-t2)]">{t('settings.share.previewOnly')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
