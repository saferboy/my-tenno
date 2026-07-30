interface CompletionRingProps {
  percent: number
  size?: number
  strokeWidth?: number
}

// Star Chart'da har planeta uchun aylana progress ko'rsatkichi.
function CompletionRing({ percent, size = 36, strokeWidth = 3 }: CompletionRingProps): React.JSX.Element {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, percent))
  const offset = circumference * (1 - clamped / 100)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-void-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-tenno-cyan)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s ease', filter: 'drop-shadow(0 0 3px rgba(78,205,196,0.5))' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] text-[var(--color-t1)]">
        {Math.round(clamped)}
      </div>
    </div>
  )
}

export default CompletionRing
