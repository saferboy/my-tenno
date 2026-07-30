interface ProgressBarProps {
  value: number
  height?: number
}

// Umumiy progress-bar - .progress-bar klassi (main.css) orqali animatsion
// shimmer effekti beradi.
function ProgressBar({ value, height = 8 }: ProgressBarProps): React.JSX.Element {
  const pct = Math.max(0, Math.min(1, value)) * 100

  return (
    <div
      className="w-full overflow-hidden rounded-full bg-[var(--color-void-border)]"
      style={{ height }}
    >
      <div className="progress-bar h-full rounded-full" style={{ width: `${pct}%` }} />
    </div>
  )
}

export default ProgressBar
