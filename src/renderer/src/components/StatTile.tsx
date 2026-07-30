import { useState } from 'react'

interface StatTileProps {
  label: string
  value: string | number
  sub?: string
  accentColor?: string
  icon?: React.ElementType
}

// Dashboard va boshqa sahifalardagi statistika kartalari uchun umumiy
// komponent - hover holatida accentColor bilan chegara yorqinlashadi.
function StatTile({ label, value, sub, accentColor = '#4ecdc4', icon: Icon }: StatTileProps): React.JSX.Element {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="t flex flex-col gap-1 rounded-lg border bg-[var(--color-void-base)] p-3"
      style={{ borderColor: hovered ? `${accentColor}4d` : 'var(--color-void-border)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-wider text-[var(--color-t3)] uppercase">{label}</span>
        {Icon && <Icon size={12} style={{ color: `${accentColor}99` }} />}
      </div>
      <div className="font-display text-xl leading-none font-extrabold text-[var(--color-t1)]">{value}</div>
      {sub && <div className="mt-0.5 text-[10px] text-[var(--color-t3)]">{sub}</div>}
    </div>
  )
}

export default StatTile
