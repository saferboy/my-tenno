export type View = 'dashboard' | 'arsenal' | 'missions' | 'nightwave' | 'riven' | 'companion' | 'settings'

interface SidebarProps {
  active: View
  onNavigate: (view: View) => void
}

const NAV_ITEMS: { view: View; label: string }[] = [
  { view: 'dashboard', label: 'Dashboard' },
  { view: 'arsenal', label: 'Arsenal' },
  { view: 'missions', label: 'Missiyalar' },
  { view: 'nightwave', label: 'Nightwave' },
  { view: 'riven', label: 'Rivenlar' },
  { view: 'companion', label: 'Companion' },
  { view: 'settings', label: 'Sozlamalar' }
]

function Sidebar({ active, onNavigate }: SidebarProps): React.JSX.Element {
  return (
    <nav className="flex w-48 shrink-0 flex-col gap-1 border-r border-[var(--orokin-border)] bg-[var(--orokin-panel)] p-4">
      <h2 className="mb-4 text-sm font-bold tracking-widest text-[var(--orokin-gold)] uppercase">Tenno Log</h2>
      {NAV_ITEMS.map(({ view, label }) => (
        <button
          key={view}
          type="button"
          onClick={() => onNavigate(view)}
          className={`chamfer px-4 py-2 text-left text-sm uppercase transition-colors ${
            active === view
              ? 'bg-[var(--orokin-gold)] font-semibold text-black'
              : 'text-[var(--orokin-text-dim)] hover:bg-[var(--orokin-border)] hover:text-[var(--orokin-text)]'
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}

export default Sidebar
