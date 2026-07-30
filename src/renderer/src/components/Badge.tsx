type BadgeTone = 'gold' | 'cyan' | 'ok' | 'violet' | 'dim'

const TONE_CLASSES: Record<BadgeTone, string> = {
  gold: 'bg-[var(--color-tenno-gold-faint)] text-[var(--color-tenno-gold)] border-[var(--color-tenno-gold)]/30',
  cyan: 'bg-[var(--color-tenno-cyan-faint)] text-[var(--color-tenno-cyan)] border-[var(--color-tenno-cyan)]/30',
  ok: 'bg-[var(--color-ok)]/10 text-[var(--color-ok)] border-[var(--color-ok)]/30',
  violet: 'bg-[var(--color-tenno-violet-dim)]/40 text-[var(--color-tenno-violet)] border-[var(--color-tenno-violet)]/30',
  dim: 'bg-[var(--color-void-surface)] text-[var(--color-t2)] border-[var(--color-void-border)]'
}

interface BadgeProps {
  tone?: BadgeTone
  children: React.ReactNode
}

// Status/rarity pill'lari (MAX, Owned, Mastered va h.k.) uchun umumiy komponent.
function Badge({ tone = 'dim', children }: BadgeProps): React.JSX.Element {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  )
}

export default Badge
