import { useEffect, useState } from 'react'
import { useAppStore } from './store/useAppStore'
import Sidebar, { type View } from './components/Sidebar'
import Dashboard from './views/Dashboard'
import Arsenal from './views/Arsenal'

function App(): React.JSX.Element {
  const [view, setView] = useState<View>('dashboard')
  const loading = useAppStore((s) => s.loading)
  const error = useAppStore((s) => s.error)
  const init = useAppStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-10">
        <p className="text-red-400">Xatolik: {error}</p>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-10">
        <p className="text-[var(--orokin-text-dim)]">Yuklanmoqda...</p>
      </main>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar active={view} onNavigate={setView} />
      {view === 'dashboard' ? <Dashboard /> : <Arsenal />}
    </div>
  )
}

export default App
