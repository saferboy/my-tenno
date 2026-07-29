import { useCallback, useEffect, useState } from 'react'
import type { BackupInfo } from '../../../main/db/backup'
import { useAppStore } from '../store/useAppStore'
import { useMissionStore } from '../store/useMissionStore'
import { useToastStore } from '../store/useToastStore'

// TDD 7.2: "Export Backup" / "Restore from Backup" - qo'lda backup boshqaruvi.
function Settings(): React.JSX.Element {
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const reloadItems = useAppStore((s) => s.init)
  const reloadMissions = useMissionStore((s) => s.init)
  const showToast = useToastStore((s) => s.show)

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
    </div>
  )
}

export default Settings
