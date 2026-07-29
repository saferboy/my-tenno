import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { WarframeItem } from '../../../main/masterData/types'
import type { ItemStatus } from '../../../main/db/types'

interface ItemCardProps {
  item: WarframeItem
  status: ItemStatus | undefined
  onClick: () => void
}

// TDD 6.1: status ranglari - Maxed = oltin, Owned = ko'k, Not Owned = kulrang.
function borderColor(status: ItemStatus | undefined): string {
  if (status?.maxed) return 'var(--orokin-gold)'
  if (status?.owned) return 'var(--orokin-cyan)'
  return 'var(--orokin-border)'
}

function ItemCard({ item, status, onClick }: ItemCardProps): React.JSX.Element {
  const wasMaxed = useRef(Boolean(status?.maxed))
  const [pulse, setPulse] = useState(false)

  // TDD 6.4: Qurol "Max" qilinganda ramka oqdan oltin rangga o'tib, yengil
  // pulse effekti beradi - faqat holat aynan shu zumda o'zgarganda ishga
  // tushadi (static "maxed" holatida qayta ijro etilmaydi).
  useEffect(() => {
    const isMaxed = Boolean(status?.maxed)
    if (isMaxed && !wasMaxed.current) {
      setPulse(true)
      const timeout = setTimeout(() => setPulse(false), 900)
      wasMaxed.current = isMaxed
      return () => clearTimeout(timeout)
    }
    wasMaxed.current = isMaxed
    return undefined
  }, [status?.maxed])

  return (
    <motion.button
      type="button"
      onClick={onClick}
      style={{ borderColor: borderColor(status) }}
      animate={
        pulse
          ? { boxShadow: ['0 0 0px #ffffff00', '0 0 16px var(--orokin-gold)', '0 0 0px #ffffff00'] }
          : { boxShadow: '0 0 0px #ffffff00' }
      }
      transition={{ duration: 0.9, ease: 'easeOut' }}
      className={`chamfer flex h-full w-full flex-col justify-between border bg-[var(--orokin-panel)] p-3 text-left transition-colors hover:bg-[var(--orokin-border)] ${
        status?.sold ? 'opacity-50' : ''
      }`}
    >
      <div>
        <p className={`text-sm font-semibold ${status?.sold ? 'line-through' : ''}`}>{item.name}</p>
        <p className="text-xs text-[var(--orokin-text-dim)]">{item.category}</p>
      </div>
      {status?.maxed && <span className="text-xs font-bold text-[var(--orokin-gold)]">MAX</span>}
      {!status?.maxed && status?.owned && <span className="text-xs text-[var(--orokin-cyan)]">Owned</span>}
    </motion.button>
  )
}

export default ItemCard
