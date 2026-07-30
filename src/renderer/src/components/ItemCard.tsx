import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { WarframeItem } from '../../../main/masterData/types'
import type { ItemStatus } from '../../../main/db/types'
import { useItemImage } from '../hooks/useItemImage'
import Badge from './Badge'

interface ItemCardProps {
  item: WarframeItem
  status: ItemStatus | undefined
  onClick: () => void
}

// TDD 6.1: status ranglari - Maxed = oltin, Owned = ko'k, Not Owned = kulrang.
function borderColor(status: ItemStatus | undefined): string {
  if (status?.maxed) return 'var(--color-tenno-gold)'
  if (status?.owned) return 'var(--color-tenno-cyan)'
  return 'var(--color-void-border)'
}

function ItemCard({ item, status, onClick }: ItemCardProps): React.JSX.Element {
  const wasMaxed = useRef(Boolean(status?.maxed))
  const [pulse, setPulse] = useState(false)
  const imageSrc = useItemImage(item.uniqueName, item.imageName)

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
          ? { boxShadow: ['0 0 0px #ffffff00', '0 0 16px var(--color-tenno-gold)', '0 0 0px #ffffff00'] }
          : { boxShadow: '0 0 0px #ffffff00' }
      }
      transition={{ duration: 0.9, ease: 'easeOut' }}
      className={`t flex h-full w-full flex-col justify-between rounded-lg border bg-[var(--color-void-base)] p-3 text-left hover:bg-[var(--color-void-surface)] ${
        status?.sold ? 'opacity-50' : ''
      }`}
    >
      <div className="flex flex-1 items-center justify-center overflow-hidden py-1">
        {imageSrc ? (
          <img src={imageSrc} alt={item.name} draggable={false} className="max-h-24 max-w-full object-contain" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-void-border)] text-xl font-bold text-[var(--color-t2)]">
            {item.name.charAt(0)}
          </div>
        )}
      </div>
      <div>
        <p className={`text-sm font-semibold ${status?.sold ? 'line-through' : ''}`}>{item.name}</p>
        <p className="text-xs text-[var(--color-t2)]">{item.category}</p>
      </div>
      {status?.maxed && <Badge tone="gold">MAX</Badge>}
      {!status?.maxed && status?.owned && <Badge tone="cyan">Owned</Badge>}
    </motion.button>
  )
}

export default ItemCard
