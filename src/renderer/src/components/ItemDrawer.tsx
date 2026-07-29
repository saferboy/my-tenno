import type { WarframeItem } from '../../../main/masterData/types'
import type { ItemStatus, ItemStatusPatch } from '../../../main/db/types'

interface ItemDrawerProps {
  item: WarframeItem
  status: ItemStatus | undefined
  onChange: (patch: ItemStatusPatch) => void
  onClose: () => void
}

// TDD 5.2: Drawer - qurolni "Max" qilish, sotilganligini belgilash, rank kiritish.
function ItemDrawer({ item, status, onChange, onClose }: ItemDrawerProps): React.JSX.Element {
  return (
    <aside className="chamfer fixed top-0 right-0 flex h-full w-80 flex-col gap-4 border-l border-[var(--orokin-border)] bg-[var(--orokin-panel)] p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--orokin-gold)]">{item.name}</h2>
          <p className="text-xs text-[var(--orokin-text-dim)]">{item.category}</p>
        </div>
        <button type="button" onClick={onClose} className="text-[var(--orokin-text-dim)] hover:text-[var(--orokin-text)]">
          ✕
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(status?.owned)}
          onChange={(e) => onChange({ owned: e.target.checked })}
        />
        Owned
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(status?.maxed)}
          onChange={(e) => onChange({ maxed: e.target.checked })}
        />
        Maxed
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={Boolean(status?.sold)} onChange={(e) => onChange({ sold: e.target.checked })} />
        Sold
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Rank
        <input
          type="number"
          min={0}
          max={30}
          value={status?.rank ?? ''}
          onChange={(e) => onChange({ rank: e.target.value === '' ? null : Number(e.target.value) })}
          className="chamfer border border-[var(--orokin-border)] bg-[var(--orokin-bg)] px-2 py-1"
        />
      </label>

      <label className="flex flex-1 flex-col gap-1 text-sm">
        Notes
        <textarea
          value={status?.notes ?? ''}
          onChange={(e) => onChange({ notes: e.target.value })}
          className="chamfer flex-1 resize-none border border-[var(--orokin-border)] bg-[var(--orokin-bg)] px-2 py-1"
        />
      </label>
    </aside>
  )
}

export default ItemDrawer
