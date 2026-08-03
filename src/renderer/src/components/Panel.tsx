interface PanelProps {
  title: string
  icon?: React.ElementType
  children: React.ReactNode
  className?: string
}

// "MISSION INFO" / "STATUS OVERVIEW" uslubidagi icon+sarlavha bilan
// karta qobig'i - surface-base'ni almashtiradi, sarlavha slotini qo'shadi.
function Panel({ title, icon: Icon, children, className = '' }: PanelProps): React.JSX.Element {
  return (
    <div className={`surface-base flex flex-col gap-3 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 border-b border-[var(--color-void-border)] pb-2">
        {Icon && <Icon size={13} className="icon-glow-cyan text-[var(--color-tenno-cyan)]" />}
        <h3 className="font-mono text-[10.5px] font-semibold tracking-widest text-[var(--color-t2)] uppercase">
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

export default Panel
