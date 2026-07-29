import { useEffect, useState } from 'react'
import type { MasterDataPayload } from '../../main/masterData/types'

interface Status {
  masterData: MasterDataPayload | null
  schemaVersion: number | null
  error: string | null
}

function countByCategory(items: MasterDataPayload['items']): [string, number][] {
  const counts = new Map<string, number>()
  for (const item of items) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
}

function App(): React.JSX.Element {
  const [status, setStatus] = useState<Status>({ masterData: null, schemaVersion: null, error: null })

  useEffect(() => {
    Promise.all([window.api.getMasterData(), window.api.getSchemaVersion()])
      .then(([masterData, schemaVersion]) => setStatus({ masterData, schemaVersion, error: null }))
      .catch((error: unknown) => setStatus({ masterData: null, schemaVersion: null, error: String(error) }))
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-10">
      <h1 className="text-2xl font-bold tracking-wide text-[var(--orokin-gold)] uppercase">TENNO LOG</h1>
      <p className="text-sm text-[var(--orokin-text-dim)]">1-Faza: Poydevor - Master Data va DB tekshiruvi</p>

      {status.error && <p className="text-red-400">Xatolik: {status.error}</p>}

      {!status.error && !status.masterData && <p className="text-[var(--orokin-text-dim)]">Yuklanmoqda...</p>}

      {status.masterData && (
        <div className="chamfer w-full max-w-xl border border-[var(--orokin-border)] bg-[var(--orokin-panel)] p-6">
          <dl className="mb-4 grid grid-cols-2 gap-2 text-sm">
            <dt className="text-[var(--orokin-text-dim)]">Master Data dataVersion</dt>
            <dd className="text-right font-mono text-[var(--orokin-cyan)]">{status.masterData.dataVersion}</dd>
            <dt className="text-[var(--orokin-text-dim)]">Schema version</dt>
            <dd className="text-right font-mono text-[var(--orokin-cyan)]">{status.schemaVersion}</dd>
            <dt className="text-[var(--orokin-text-dim)]">Jami item</dt>
            <dd className="text-right font-mono text-[var(--orokin-cyan)]">{status.masterData.items.length}</dd>
          </dl>
          <ul className="space-y-1 text-sm">
            {countByCategory(status.masterData.items).map(([category, count]) => (
              <li key={category} className="flex justify-between border-b border-[var(--orokin-border)] py-1">
                <span>{category}</span>
                <span className="text-[var(--orokin-text-dim)]">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}

export default App
