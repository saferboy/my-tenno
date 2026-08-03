interface PanelProps {
  title: string
  icon?: React.ElementType
  children: React.ReactNode
  className?: string
  tone?: 'cyan' | 'gold'
}

const TONE_STYLE: Record<'cyan' | 'gold', { border: string; shadow: string; text: string; glow: string }> = {
  cyan: {
    border: '1px solid rgba(0,210,255,.2)',
    shadow: 'inset 0 0 15px rgba(0,210,255,.15)',
    text: '#00d2ff',
    glow: '0 0 10px rgba(0,210,255,.6)'
  },
  gold: {
    border: '1px solid rgba(255,224,102,.22)',
    shadow: 'inset 0 0 15px rgba(255,224,102,.1)',
    text: '#ffe066',
    glow: '0 0 10px rgba(255,224,102,.5)'
  }
}

// "MISSION INFO" / "STATUS OVERVIEW" uslubidagi shisha-panel qobig'i
// (design handoff maketidagi glass + clip-corner texnikasi).
function Panel({ title, icon: Icon, children, className = '', tone = 'cyan' }: PanelProps): React.JSX.Element {
  const s = TONE_STYLE[tone]

  return (
    <div
      className={`glass-panel clip-corner flex flex-col gap-3 p-4 ${className}`}
      style={{ border: s.border, boxShadow: s.shadow }}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon size={13} style={{ color: s.text, filter: `drop-shadow(0 0 3px ${s.text}80)` }} />}
        <h3
          className="font-mono text-[11px] tracking-[3px] uppercase"
          style={{ color: s.text, textShadow: s.glow }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

export default Panel
