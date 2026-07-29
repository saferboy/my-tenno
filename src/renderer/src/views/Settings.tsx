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
    refreshBackups()
  }, [refreshBackups])

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
      <h1 className="text-xl font-bold tracking-wide text-[var(--orokin-gold)] uppercase">Sozlamalar</h1>

      <div className="chamfer flex flex-wrap items-center gap-3 border border-[var(--orokin-border)] bg-[var(--orokin-panel)] p-4">
        <p className="text-xs tracking-wide text-[var(--orokin-text-dim)] uppercase">
          Mini Overlay (bugungi vazifalar, o'yin ustida)
        </p>
        <button
          type="button"
          onClick={handleToggleOverlay}
          className="chamfer border border-[var(--orokin-border)] px-4 py-2 text-sm text-[var(--orokin-text-dim)] hover:text-[var(--orokin-text)]"
        >
          {overlayOpen ? "O'chirish" : "Yoqish"}
        </button>
      </div>

      <div className="chamfer flex flex-wrap gap-3 border border-[var(--orokin-border)] bg-[var(--orokin-panel)] p-4">
        <button
          type="button"
          onClick={handleCreateBackup}
          className="chamfer bg-[var(--orokin-gold)] px-4 py-2 text-sm font-semibold text-black"
        >
          Backup yaratish
        </button>
        <button
          type="button"
          onClick={handleExportJson}
          className="chamfer border border-[var(--orokin-border)] px-4 py-2 text-sm text-[var(--orokin-text-dim)] hover:text-[var(--orokin-text)]"
        >
          JSON eksport qilish
        </button>
      </div>

      <div className="chamfer border border-[var(--orokin-border)] bg-[var(--orokin-panel)] p-4">
        <p className="mb-2 text-xs tracking-wide text-[var(--orokin-text-dim)] uppercase">
          Backup'lar (oxirgi 5 tasi saqlanadi)
        </p>
        {backups.length === 0 && <p className="text-sm text-[var(--orokin-text-dim)]">Hali backup yo'q.</p>}
        <ul className="space-y-1">
          {backups.map((backup) => (
            <li
              key={backup.fileName}
              className="flex items-center justify-between border-b border-[var(--orokin-border)] py-2 text-sm"
            >
              <span>
                {backup.fileName}
                <span className="ml-2 text-[var(--orokin-text-dim)]">
                  {new Date(backup.createdAt).toLocaleString()}
                </span>
              </span>
              <button
                type="button"
                onClick={() => handleRestore(backup.fileName)}
                className="chamfer border border-[var(--orokin-border)] px-3 py-1 text-xs uppercase text-[var(--orokin-cyan)] hover:bg-[var(--orokin-border)]"
              >
                Restore
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="chamfer border border-[var(--orokin-border)] bg-[var(--orokin-panel)] p-4">
        <p className="mb-2 text-xs tracking-wide text-[var(--orokin-text-dim)] uppercase">
          Share Code (Profile Export/Import)
        </p>

        <div className="mb-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleGenerateShareCode}
            className="chamfer self-start bg-[var(--orokin-gold)] px-4 py-2 text-sm font-semibold text-black"
          >
            Share Code yaratish
          </button>
          {shareCode && (
            <div className="flex flex-col gap-2">
              <textarea
                readOnly
                value={shareCode}
                className="chamfer h-24 border border-[var(--orokin-border)] bg-[var(--orokin-bg)] px-2 py-1 text-xs"
              />
              <button
                type="button"
                onClick={handleCopyShareCode}
                className="chamfer self-start border border-[var(--orokin-border)] px-3 py-1 text-xs uppercase text-[var(--orokin-cyan)] hover:bg-[var(--orokin-border)]"
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
            className="chamfer h-24 border border-[var(--orokin-border)] bg-[var(--orokin-bg)] px-2 py-1 text-xs"
          />
          <button
            type="button"
            onClick={handleImportShareCode}
            className="chamfer self-start border border-[var(--orokin-border)] px-3 py-1 text-xs uppercase text-[var(--orokin-cyan)] hover:bg-[var(--orokin-border)]"
          >
            Import qilish (faqat ko'rish)
          </button>
          {importedPreview && (
            <div className="chamfer border border-[var(--orokin-border)] bg-[var(--orokin-bg)] p-3 text-xs">
              <p>Eksport sanasi: {new Date(importedPreview.exportedAt).toLocaleString()}</p>
              <p>Qurol/frame yozuvlari: {importedPreview.itemStatuses.length}</p>
              <p>Missiya yozuvlari: {importedPreview.missionStatuses.length}</p>
              <p className="mt-1 text-[var(--orokin-text-dim)]">
                Bu faqat ko'rish uchun - sizning bazangizga qo'shilmaydi.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
