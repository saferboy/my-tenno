import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useWishlistStore } from '../store/useWishlistStore'
import { useItemImage } from '../hooks/useItemImage'
import { MY_COLLECTION_CATEGORIES } from '../constants'
import { useT } from '../i18n/useT'
import type { WarframeItem } from '../../../main/masterData/types'

function WishlistCard({
  itemName,
  item,
  notes,
  onDelete
}: {
  itemName: string
  item: WarframeItem | undefined
  notes: string | null
  onDelete: () => void
}): React.JSX.Element {
  const imageSrc = useItemImage(item?.uniqueName ?? itemName, item?.imageName)
  const t = useT()

  return (
    <div className="surface-base flex items-center gap-3 rounded-lg p-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--color-void-black)]">
        {imageSrc ? (
          <img src={imageSrc} alt={itemName} draggable={false} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-lg font-bold text-[var(--color-t2)]">{itemName.charAt(0)}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--color-t1)]">{itemName}</p>
        <p className="truncate text-xs text-[var(--color-t3)]">
          {item?.category ?? t('wishlist.otherCategory')}
        </p>
        {notes && <p className="mt-1 text-xs text-[var(--color-t2)]">{notes}</p>}
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 text-[var(--color-t2)] hover:text-[var(--color-danger)]"
      >
        ✕
      </button>
    </div>
  )
}

// Wishlist - foydalanuvchi umumiy katalogdan (Weapons/Warframes/Companion)
// tanlab, "orzu qilingan" narsalarni saqlaydigan erkin ro'yxat.
function WishlistPage(): React.JSX.Element {
  const items = useAppStore((s) => s.items)
  const loading = useWishlistStore((s) => s.loading)
  const wishlistItems = useWishlistStore((s) => s.items)
  const init = useWishlistStore((s) => s.init)
  const addItem = useWishlistStore((s) => s.addItem)
  const removeItem = useWishlistStore((s) => s.removeItem)
  const t = useT()

  useEffect(() => {
    init()
  }, [init])

  const pickable = useMemo(
    () =>
      items
        .filter((i) => MY_COLLECTION_CATEGORIES.has(i.category))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  )
  const itemByUniqueName = useMemo(() => new Map(items.map((i) => [i.uniqueName, i])), [items])

  const [itemUniqueName, setItemUniqueName] = useState('')
  const [notes, setNotes] = useState('')

  async function handleAdd(event: FormEvent): Promise<void> {
    event.preventDefault()
    const item = itemByUniqueName.get(itemUniqueName)
    if (!item) return

    await addItem({
      itemUniqueName: item.uniqueName,
      itemName: item.name,
      notes: notes.trim() || null
    })

    setItemUniqueName('')
    setNotes('')
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[var(--color-t2)]">{t('app.loading')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
      <h1 className="font-display text-xl font-extrabold tracking-wide text-[var(--color-tenno-gold)] uppercase">
        {t('sidebar.nav.wishlist')}
      </h1>

      <form onSubmit={handleAdd} className="surface-base flex flex-col gap-2 rounded-lg p-4">
        <select
          value={itemUniqueName}
          onChange={(e) => setItemUniqueName(e.target.value)}
          required
          className="rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-black)] px-3 py-2 text-sm"
        >
          <option value="">{t('wishlist.selectPlaceholder')}</option>
          {pickable.map((item) => (
            <option key={item.uniqueName} value={item.uniqueName}>
              {item.name} ({item.category})
            </option>
          ))}
        </select>
        <textarea
          placeholder={t('wishlist.notesPlaceholder')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-black)] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="self-start rounded-md bg-[var(--color-tenno-gold)] px-4 py-2 text-sm font-semibold text-black"
        >
          {t('wishlist.add')}
        </button>
      </form>

      {wishlistItems.length === 0 && (
        <p className="text-sm text-[var(--color-t2)]">{t('wishlist.empty')}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {wishlistItems.map((entry) => (
          <WishlistCard
            key={entry.id}
            itemName={entry.itemName}
            item={entry.itemUniqueName ? itemByUniqueName.get(entry.itemUniqueName) : undefined}
            notes={entry.notes}
            onDelete={() => removeItem(entry.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default WishlistPage
