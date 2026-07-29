import { useEffect } from 'react'
import { useToastStore } from '../store/useToastStore'

const AUTO_DISMISS_MS = 5000

function Toast(): React.JSX.Element | null {
  const message = useToastStore((s) => s.message)
  const clear = useToastStore((s) => s.clear)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(clear, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [message, clear])

  if (!message) return null

  return (
    <div className="chamfer fixed bottom-6 left-1/2 z-50 -translate-x-1/2 border border-[var(--orokin-border)] bg-[var(--orokin-panel)] px-4 py-3 text-sm shadow-lg">
      <span>{message}</span>
      <button type="button" onClick={clear} className="ml-3 text-[var(--orokin-text-dim)] hover:text-[var(--orokin-text)]">
        ✕
      </button>
    </div>
  )
}

export default Toast
