import { useEffect, useState } from 'react'

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const clock = [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':')
  return days > 0 ? `${days} kun ${clock}` : clock
}

interface ResetCountdownProps {
  label: string
  target: number
}

// TDD 5.4: kunlik/haftalik reset countdown - Warframe reset UTC 00:00'da
// bo'ladi (kunlik har kuni, haftalik dushanba kuni).
function ResetCountdown({ label, target }: ResetCountdownProps): React.JSX.Element {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="surface-base rounded-lg p-4">
      <p className="font-mono text-[10px] tracking-widest text-[var(--color-t3)] uppercase">{label}</p>
      <p className="mt-1 font-mono text-xl text-[var(--color-tenno-cyan)]">{formatRemaining(target - now)}</p>
    </div>
  )
}

export default ResetCountdown
