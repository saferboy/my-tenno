import {
  LayoutDashboard,
  Crosshair,
  Package,
  Shield,
  Bot,
  Heart,
  Globe,
  Milestone,
  Scroll,
  Zap,
  Hammer,
  BookOpen,
  User,
  Coins,
  Gem,
  Settings as SettingsIcon
} from 'lucide-react'
import { useUserProfileStore } from '../store/useUserProfileStore'
import { useT } from '../i18n/useT'
import type { TranslationKey } from '../i18n/translations'
import EditableNumber from './EditableNumber'

export type View =
  | 'dashboard'
  | 'myCollection'
  | 'weapons'
  | 'warframes'
  | 'wishlist'
  | 'foundry'
  | 'missions'
  | 'quests'
  | 'nightwave'
  | 'riven'
  | 'companion'
  | 'profile'
  | 'settings'

type TopTab = 'dashboard' | 'map' | 'equipment' | 'codex' | 'profile' | 'system'

interface NavItem {
  view: View
  labelKey: TranslationKey
  icon: React.ElementType
}

interface TabGroup {
  tab: TopTab
  labelKey: TranslationKey
  icon: React.ElementType
  views: NavItem[]
}

const TAB_GROUPS: TabGroup[] = [
  {
    tab: 'dashboard',
    labelKey: 'topnav.tab.dashboard',
    icon: LayoutDashboard,
    views: [{ view: 'dashboard', labelKey: 'sidebar.nav.dashboard', icon: LayoutDashboard }]
  },
  {
    tab: 'map',
    labelKey: 'topnav.tab.map',
    icon: Globe,
    views: [{ view: 'missions', labelKey: 'sidebar.nav.missions', icon: Globe }]
  },
  {
    tab: 'equipment',
    labelKey: 'topnav.tab.equipment',
    icon: Package,
    views: [
      { view: 'myCollection', labelKey: 'sidebar.nav.myCollection', icon: Package },
      { view: 'weapons', labelKey: 'sidebar.nav.weapons', icon: Crosshair },
      { view: 'warframes', labelKey: 'sidebar.nav.warframes', icon: Shield },
      { view: 'companion', labelKey: 'sidebar.nav.companion', icon: Bot },
      { view: 'riven', labelKey: 'sidebar.nav.riven', icon: Zap },
      { view: 'foundry', labelKey: 'sidebar.nav.foundry', icon: Hammer }
    ]
  },
  {
    tab: 'codex',
    labelKey: 'topnav.tab.codex',
    icon: BookOpen,
    views: [
      { view: 'quests', labelKey: 'sidebar.nav.quests', icon: Milestone },
      { view: 'nightwave', labelKey: 'sidebar.nav.nightwave', icon: Scroll },
      { view: 'wishlist', labelKey: 'sidebar.nav.wishlist', icon: Heart }
    ]
  },
  {
    tab: 'profile',
    labelKey: 'topnav.tab.profile',
    icon: User,
    views: [{ view: 'profile', labelKey: 'topnav.tab.profile', icon: User }]
  },
  {
    tab: 'system',
    labelKey: 'topnav.tab.system',
    icon: SettingsIcon,
    views: [{ view: 'settings', labelKey: 'sidebar.nav.settings', icon: SettingsIcon }]
  }
]

interface TopNavProps {
  active: View
  onNavigate: (view: View) => void
}

function TopNav({ active, onNavigate }: TopNavProps): React.JSX.Element {
  const credits = useUserProfileStore((s) => s.credits)
  const platinum = useUserProfileStore((s) => s.platinum)
  const setCredits = useUserProfileStore((s) => s.setCredits)
  const setPlatinum = useUserProfileStore((s) => s.setPlatinum)
  const t = useT()

  const activeGroup = TAB_GROUPS.find((g) => g.views.some((v) => v.view === active)) ?? TAB_GROUPS[0]
  const subViews = activeGroup.views.length > 1 ? activeGroup.views : null

  function handleTabClick(group: TabGroup): void {
    if (group.views.some((v) => v.view === active)) return
    onNavigate(group.views[0].view)
  }

  return (
    <header
      className="relative z-10 flex shrink-0 flex-col"
      style={{ background: 'rgba(3,9,20,.9)', borderBottom: '1px solid rgba(0,210,255,.18)' }}
    >
      <div className="flex h-14 shrink-0 items-center gap-6 px-4">
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[var(--color-tenno-cyan)] to-[var(--color-tenno-blue)]">
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none">
              <polygon
                points="12,2 22,8 22,16 12,22 2,16 2,8"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="1.2"
                fill="rgba(255,255,255,0.08)"
              />
              <circle cx="12" cy="12" r="3.5" fill="rgba(255,255,255,0.8)" />
            </svg>
          </div>
          <div className="hidden overflow-hidden sm:block">
            <div className="font-display text-sm leading-tight font-bold tracking-wide text-[var(--color-t1)]">
              MY TENNO
            </div>
            <div className="font-mono text-[9px] tracking-widest text-[var(--color-tenno-cyan)]">TENNO LOG</div>
          </div>
        </div>

        <nav className="flex flex-1 items-center gap-1 self-stretch overflow-x-auto">
          {TAB_GROUPS.map((group) => {
            const isActive = group.views.some((v) => v.view === active)
            const Icon = group.icon
            return (
              <button
                key={group.tab}
                type="button"
                onClick={() => handleTabClick(group)}
                className={`t hover-glow flex h-full items-center gap-2 border-b-2 border-transparent px-3 font-mono text-[11px] font-semibold tracking-widest uppercase ${
                  isActive ? 'nav-tab-active' : 'text-[var(--color-t3)] hover:text-[#aee9ff]'
                }`}
              >
                <Icon size={14} strokeWidth={isActive ? 1.8 : 1.6} className={isActive ? 'icon-glow-cyan text-[var(--color-tenno-cyan)]' : ''} />
                {t(group.labelKey)}
              </button>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 font-mono text-xs">
          <div
            className="flex items-center gap-2 px-3.5 py-1.5"
            style={{ border: '1px solid rgba(0,210,255,.25)', background: 'rgba(0,210,255,.06)' }}
          >
            <Coins size={13} className="icon-glow-cyan shrink-0 text-[var(--color-tenno-cyan)]" />
            <EditableNumber
              value={credits}
              onCommit={setCredits}
              format={(v) => v.toLocaleString()}
              className="font-mono text-xs text-[#9fdcff] hover:text-[var(--color-tenno-cyan)]"
            />
          </div>
          <div
            className="flex items-center gap-2 px-3.5 py-1.5"
            style={{ border: '1px solid rgba(255,224,102,.3)', background: 'rgba(255,224,102,.06)' }}
          >
            <Gem size={13} className="icon-glow-gold shrink-0 text-[var(--color-tenno-gold)]" />
            <EditableNumber
              value={platinum}
              onCommit={setPlatinum}
              format={(v) => v.toLocaleString()}
              className="font-mono text-xs text-[var(--color-tenno-gold)] hover:text-[var(--color-tenno-gold)]"
            />
          </div>
        </div>
      </div>

      {subViews && (
        <div className="flex h-9 shrink-0 items-center gap-1 border-t border-[var(--color-void-border)] bg-[var(--color-void-black)] px-4">
          {subViews.map(({ view, labelKey, icon: Icon }) => {
            const isActive = active === view
            return (
              <button
                key={view}
                type="button"
                onClick={() => onNavigate(view)}
                className={`t hover-glow flex h-full items-center gap-1.5 border-b-2 border-transparent px-2.5 text-[11.5px] ${
                  isActive
                    ? 'nav-tab-active'
                    : 'text-[var(--color-t3)] hover:text-[var(--color-t1)]'
                }`}
              >
                <Icon size={12} className={isActive ? 'text-[var(--color-tenno-cyan)]' : ''} />
                {t(labelKey)}
              </button>
            )
          })}
        </div>
      )}
    </header>
  )
}

export default TopNav
