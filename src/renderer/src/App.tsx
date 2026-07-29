import { useEffect, useState } from 'react'
import { useAppStore } from './store/useAppStore'
import Sidebar, { type View } from './components/Sidebar'
import Dashboard from './views/Dashboard'
import Arsenal from './views/Arsenal'
import MissionTracker from './views/MissionTracker'
import NightwaveTracker from './views/NightwaveTracker'
import RivenTracker from './views/RivenTracker'
import CompanionFocus from './views/CompanionFocus'
import Settings from './views/Settings'

const VIEWS: Record<View, () => React.JSX.Element> = {
  dashboard: Dashboard,
  arsenal: Arsenal,
  missions: MissionTracker,
  nightwave: NightwaveTracker,
  riven: RivenTracker,
  companion: CompanionFocus,
  settings: Settings
}

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

  const ActiveView = VIEWS[view]

  return (
    <div className="flex min-h-screen">
      <Sidebar active={view} onNavigate={setView} />
      <ActiveView />
    </div>
  )
}

export default App
