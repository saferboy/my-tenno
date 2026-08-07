import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import type { WarframeItem } from '../../../main/masterData/types'
import type { ItemStatus, ItemStatusPatch } from '../../../main/db/types'
import { useT } from '../i18n/useT'

interface ItemDrawerProps {
  item: WarframeItem
  status: ItemStatus | undefined
  onChange: (patch: ItemStatusPatch) => void
  onClose: () => void
  extra?: ReactNode
}

// TDD 5.2: Drawer - qurolni "Max" qilish, sotilganligini belgilash, rank kiritish.
// Backdrop (orqa fonni qorong'ilashtirish) + tashqarisiga bosganda yopilish -
// avval panel hech qanday animatsiyasiz, birdaniga paydo bo'lardi va ortidagi
// grid bilan hech qanday vizual ajratuvchisi yo'q edi ("yoqimsiz" edi).
// document.body'ga portal qilib chiqariladi - App.tsx'dagi sahifa
// almashinuvi motion.div'i CSS transform qo'yadi, bu esa uning ichidagi
// har qanday `fixed` elementni haqiqiy oyna emas, shu motion.div'ga nisbatan
// joylashtirib qo'yadi (CSS spetsifikatsiyasi) - natijada backdrop sidebar
// ustini qoplamay qolar va tashqariga bosish sidebar hududida ishlamas edi.
function ItemDrawer({
  item,
  status,
  onChange,
  onClose,
  extra
}: ItemDrawerProps): React.JSX.Element {
  const t = useT()
  return createPortal(
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      <motion.aside
        className="fixed top-0 right-0 z-40 flex h-full w-80 flex-col gap-4 rounded-l-lg border-l border-[var(--color-void-border)] bg-[var(--color-void-base)] p-6 shadow-2xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--color-tenno-gold)]">
              {item.name}
            </h2>
            <p className="text-xs text-[var(--color-t2)]">{item.category}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-t2)] hover:text-[var(--color-t1)]"
          >
            ✕
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(status?.owned)}
            onChange={(e) => onChange({ owned: e.target.checked })}
          />
          {t('common.owned')}
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(status?.maxed)}
            onChange={(e) => onChange({ maxed: e.target.checked })}
          />
          {t('common.maxed')}
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(status?.sold)}
            onChange={(e) => onChange({ sold: e.target.checked })}
          />
          {t('common.sold')}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t('common.rank')}
          <input
            type="number"
            min={0}
            max={30}
            value={status?.rank ?? ''}
            onChange={(e) =>
              onChange({ rank: e.target.value === '' ? null : Number(e.target.value) })
            }
            className="rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-black)] px-2 py-1"
          />
        </label>

        {extra}

        <label className="flex flex-1 flex-col gap-1 text-sm">
          {t('common.notes')}
          <textarea
            value={status?.notes ?? ''}
            onChange={(e) => onChange({ notes: e.target.value })}
            className="flex-1 resize-none rounded-md border border-[var(--color-void-border)] bg-[var(--color-void-black)] px-2 py-1"
          />
        </label>
      </motion.aside>
    </>,
    document.body
  )
}

export default ItemDrawer
