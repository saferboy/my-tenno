interface PaginationProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

// Katta ro'yxatlar (Weapons/Warframes/Mening qurollarim/Companion va h.k.)
// uchun umumiy sahifalash boshqaruvi - cheksiz virtualized scroll o'rniga.
function Pagination({ page, pageCount, onChange }: PaginationProps): React.JSX.Element | null {
  if (pageCount <= 1) return null

  const buttonClass =
    't rounded-md border border-[var(--color-void-border)] px-2.5 py-1.5 text-xs text-[var(--color-t2)] hover:text-[var(--color-t1)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-[var(--color-t2)]'

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <button type="button" className={buttonClass} disabled={page === 0} onClick={() => onChange(0)}>
        «
      </button>
      <button type="button" className={buttonClass} disabled={page === 0} onClick={() => onChange(page - 1)}>
        ‹
      </button>
      <span className="font-mono text-xs text-[var(--color-t2)]">
        {page + 1} / {pageCount}
      </span>
      <button
        type="button"
        className={buttonClass}
        disabled={page >= pageCount - 1}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
      <button
        type="button"
        className={buttonClass}
        disabled={page >= pageCount - 1}
        onClick={() => onChange(pageCount - 1)}
      >
        »
      </button>
    </div>
  )
}

export default Pagination
