import { useEffect, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useAppStore } from './store/useAppStore'
import { useUserProfileStore } from './store/useUserProfileStore'
import { useT } from './i18n/useT'
import TopNav, { type View } from './components/TopNav'
import Dashboard from './views/Dashboard'
import MyCollection from './views/MyCollection'
import WeaponsPage from './views/WeaponsPage'
import WarframesPage from './views/WarframesPage'
import WishlistPage from './views/WishlistPage'
import FoundryPage from './views/FoundryPage'
import MissionTracker from './views/MissionTracker'
import QuestTimeline from './views/QuestTimeline'
import NightwaveTracker from './views/NightwaveTracker'
import RivenTracker from './views/RivenTracker'
import CompanionFocus from './views/CompanionFocus'
import ProfilePage from './views/ProfilePage'
import Settings from './views/Settings'

// TDD 6.4: sahifa o'zgarganda elementlar biroz "glitch" bo'lib paydo bo'ladi.
const glitchVariants: Variants = {
  initial: { opacity: 0, x: -6, skewX: -2, filter: 'hue-rotate(20deg)' },
  animate: {
    opacity: 1,
    x: 0,
    skewX: 0,
    filter: 'hue-rotate(0deg)',
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  exit: { opacity: 0, x: 6, skewX: 2, transition: { duration: 0.15 } }
}

const VIEWS: Record<View, () => React.JSX.Element> = {
  dashboard: Dashboard,
  myCollection: MyCollection,
  weapons: WeaponsPage,
  warframes: WarframesPage,
  wishlist: WishlistPage,
  foundry: FoundryPage,
  missions: MissionTracker,
  quests: QuestTimeline,
  nightwave: NightwaveTracker,
  riven: RivenTracker,
  companion: CompanionFocus,
  profile: ProfilePage,
  settings: Settings
}

function App(): React.JSX.Element {
  const [view, setView] = useState<View>('dashboard')
  const loading = useAppStore((s) => s.loading)
  const error = useAppStore((s) => s.error)
  const init = useAppStore((s) => s.init)
  const initProfile = useUserProfileStore((s) => s.init)
  const t = useT()

  useEffect(() => {
    init()
    initProfile()
  }, [init, initProfile])

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-10">
        <p className="text-[var(--color-danger)]">{t('app.error', { message: error })}</p>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-10">
        <p className="text-[var(--color-t2)]">{t('app.loading')}</p>
      </main>
    )
  }

  const ActiveView = VIEWS[view]

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopNav active={view} onNavigate={setView} />
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          variants={glitchVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex min-h-0 min-w-0 flex-1"
        >
          <ActiveView />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default App
