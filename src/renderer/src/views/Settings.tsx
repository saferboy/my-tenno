import { useCallback, useEffect, useState } from 'react'
import type { BackupInfo } from '../../../main/db/backup'
import type { SharePayload } from '../../../main/shareCode'
import { useAppStore } from '../store/useAppStore'
import { useMissionStore } from '../store/useMissionStore'
import { useToastStore } from '../store/useToastStore'

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

  async function handleGenerateShareCode(): Promise<void> {
    try {
      setShareCode(await window.api.generateShareCode())
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error))
    }
  }

  async function handleCopyShareCode(): Promise<void> {
    if (!shareCode) return
    await navigator.clipboard.writeText(shareCode)
    showToast('Nusxalandi.')
  }

  async function handleImportShareCode(): Promise<void> {
    try {
      setImportedPreview(await window.api.parseShareCode(importCode))
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error))
    }
  }

  async function handleToggleOverlay(): Promise<void> {
    try {
      setOverlayOpen(await window.api.toggleOverlay())
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error))
    }
  }

  const refreshBackups = useCallback(async () => {
    try {
      setBackups(await window.api.listBackups())
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error))
    }
  }, [showToast])

  useEffect(() => {
    window.api.listBackups().then(setBackups, (error) => {
      showToast(error instanceof Error ? error.message : String(error))
    })
  }, [showToast])

  async function handleCreateBackup(): Promise<void> {
    try {
      const info = await window.api.createBackup()
      showToast(info ? `Backup yaratildi: ${info.fileName}` : "Hali baza mavjud emas, backup kerak emas.")
      await refreshBackups()
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error))
    }
  }

  async function handleRestore(fileName: string): Promise<void> {
    const confirmed = window.confirm(
      `"${fileName}" fayldan tiklansinmi? Joriy holat avtomatik backup qilinadi, lekin so'nggi o'zgarishlar shu backup bilan almashtiriladi.`
    )
    if (!confirmed) return

    try {
      await window.api.restoreBackup(fileName)
      showToast('Baza tiklandi.')
      await Promise.all([reloadItems(), reloadMissions(), refreshBackups()])
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error))
    }
  }

  async function handleExportJson(): Promise<void> {
    try {
      const result = await window.api.exportJson()
      showToast(result.saved ? `Eksport qilindi: ${result.filePath}` : 'Eksport bekor qilindi.')
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
      <h1 className="font-display text-xl font-extrabold tracking-wide text-[var(--color-tenno-gold)] uppercase">
        Sozlamalar
      </h1>

      <div className="surface-base flex flex-wrap items-center gap-3 rounded-lg p-4">
        <p className="font-mono text-[10px] tracking-widest text-[var(--color-t3)] uppercase">
          Mini Overlay (bugungi vazifalar, o&apos;yin ustida)
        </p>
        <button
          type="button"
          onClick={handleToggleOverlay}
          className="rounded-md border border-[var(--color-void-border)] px-4 py-2 text-sm text-[var(--color-t2)] hover:text-[var(--color-t1)]"
        >
          {overlayOpen ? "O'chirish" : "Yoqish"}
        </button>
      </div>

      <div className="surface-base flex flex-wrap gap-3 rounded-lg p-4">
        <button
          type="button"
          onClick={handleCreateBackup}
          className="rounded-md bg-[var(--color-tenno-gold)] px-4 py-2 text-sm font-semibold text-black"
        >
          Backup yaratish
        </button>
        <button
          type="button"
          onClick={handleExportJson}
          className="rounded-md border border-[var(--color-void-border)] px-4 py-2 text-sm text-[var(--color-t2)] hover:text-[var(--color-t1)]"
        >
          JSON eksport qilish
        </button>
      </div>

      <div className="surface-base rounded-lg p-4">
        <p className="mb-2 font-mono text-[10px] tracking-widest text-[var(--color-t3)] uppercase">
          Backup&apos;lar (oxirgi 5 tasi saqlanadi)
        </p>
        {backups.length === 0 && <p className="text-sm text-[var(--color-t2)]">Hali backup yo&apos;q.</p>}
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
                Restore
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="surface-base rounded-lg p-4">
        <p className="mb-2 font-mono text-[10px] tracking-widest text-[var(--color-t3)] uppercase">
          Share Code (Profile Export/Import)
        </p>

        <div className="mb-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleGenerateShareCode}
            className="self-start rounded-md bg-[var(--color-tenno-gold)] px-4 py-2 text-sm font-semibold text-black"
          >
            Share Code yaratish
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
                Nusxalash
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <textarea
            placeholder="Boshqa foydalanuvchining Share Code'ini shu yerga joylashtiring"
            value={importCode}
            onChange={(e) => setImportCode(e.target.value)}
            className="h-24 rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-black)] px-2 py-1 text-xs"
          />
          <button
            type="button"
            onClick={handleImportShareCode}
            className="self-start rounded border border-[var(--color-void-border)] px-3 py-1 text-xs uppercase text-[var(--color-tenno-cyan)] hover:bg-[var(--color-void-border)]"
          >
            Import qilish (faqat ko&apos;rish)
          </button>
          {importedPreview && (
            <div className="rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-black)] p-3 text-xs">
              <p>Eksport sanasi: {new Date(importedPreview.exportedAt).toLocaleString()}</p>
              <p>Qurol/frame yozuvlari: {importedPreview.itemStatuses.length}</p>
              <p>Missiya yozuvlari: {importedPreview.missionStatuses.length}</p>
              <p className="mt-1 text-[var(--color-t2)]">
                Bu faqat ko&apos;rish uchun - sizning bazangizga qo&apos;shilmaydi.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
