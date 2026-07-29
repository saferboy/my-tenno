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
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ borderColor: borderColor(status) }}
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
    </button>
  )
}

export default ItemCard
