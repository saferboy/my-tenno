import {
  LayoutDashboard,
  Crosshair,
  Bot,
  Globe,
  Scroll,
  Zap,
  Settings as SettingsIcon
} from 'lucide-react'
import ProgressBar from './ProgressBar'

export type View = 'dashboard' | 'arsenal' | 'missions' | 'nightwave' | 'riven' | 'companion' | 'settings'

interface SidebarProps {
  active: View
  onNavigate: (view: View) => void
}

interface NavItem {
  view: View
  label: string
  icon: React.ElementType
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'OVERVIEW',
    items: [{ view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }]
  },
  {
    label: 'ARSENAL',
    items: [
      { view: 'arsenal', label: 'Arsenal', icon: Crosshair },
      { view: 'companion', label: 'Companion', icon: Bot }
    ]
  },
  {
    label: 'JOURNEY',
    items: [
      { view: 'missions', label: 'Missiyalar', icon: Globe },
      { view: 'nightwave', label: 'Nightwave', icon: Scroll },
      { view: 'riven', label: 'Rivenlar', icon: Zap }
    ]
  }
]

function Sidebar({ active, onNavigate }: SidebarProps): React.JSX.Element {
  return (
    <nav className="flex w-56 shrink-0 flex-col border-r border-[var(--color-void-border)] bg-[var(--color-void-dark)]">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[var(--color-void-border)] px-3">
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
        <div className="overflow-hidden">
          <div className="font-display text-sm leading-tight font-bold tracking-wide text-[var(--color-t1)]">
            MY TENNO
          </div>
          <div className="font-mono text-[9px] tracking-widest text-[var(--color-tenno-cyan)]">TENNO LOG</div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-1">
            <div className="px-3 pt-3 pb-1 font-mono text-[9.5px] font-semibold tracking-widest text-[var(--color-t3)]">
              {group.label}
            </div>
            {group.items.map(({ view, label, icon: Icon }) => {
              const isActive = active === view
              return (
                <button
                  key={view}
                  type="button"
                  onClick={() => onNavigate(view)}
                  className={`t flex h-9 w-full items-center gap-2.5 border-l-2 px-3 text-left text-[12.5px] ${
                    isActive
                      ? 'nav-active border-l-[var(--color-tenno-cyan)] text-[var(--color-t1)]'
                      : 'border-l-transparent text-[var(--color-t2)] hover:bg-white/3 hover:text-[var(--color-t1)]'
                  }`}
                >
                  <Icon size={14} strokeWidth={isActive ? 1.8 : 1.6} className={isActive ? 'text-[var(--color-tenno-cyan)]' : ''} />
                  <span className="flex-1">{label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Settings - guruhdan tashqarida, pastda pin qilingan */}
      <div className="border-t border-[var(--color-void-border)]">
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className={`t flex h-9 w-full items-center gap-2.5 border-l-2 px-3 text-left text-[12.5px] ${
            active === 'settings'
              ? 'nav-active border-l-[var(--color-tenno-cyan)] text-[var(--color-t1)]'
              : 'border-l-transparent text-[var(--color-t2)] hover:bg-white/3 hover:text-[var(--color-t1)]'
          }`}
        >
          <SettingsIcon size={14} strokeWidth={1.6} className={active === 'settings' ? 'text-[var(--color-tenno-cyan)]' : ''} />
          <span className="flex-1">Sozlamalar</span>
        </button>
      </div>

      {/* Profil - Phase 2'da haqiqiy (qo'lda kiritiladigan) ma'lumotga ulanadi,
          hozircha vizual qobiq bo'sh/nol holatda. */}
      <div className="border-t border-[var(--color-void-border)] bg-[var(--color-void-black)] px-3 py-2.5">
        <div className="mb-2 flex items-center gap-2">
          <div className="rank-badge flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold text-white">
            —
          </div>
          <div>
            <div className="text-xs font-semibold text-[var(--color-t1)]">Tenno</div>
            <div className="font-mono text-[10px] text-[var(--color-t2)]">Mastery Rank —</div>
          </div>
        </div>
        <ProgressBar value={0} height={3} />
        <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-[var(--color-t3)]">
          <span>₵ —</span>
          <span>⬡ —</span>
        </div>
      </div>
    </nav>
  )
}

export default Sidebar
