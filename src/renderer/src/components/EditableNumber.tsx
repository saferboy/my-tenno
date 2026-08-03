import { useState } from 'react'

interface EditableNumberProps {
  value: number
  onCommit: (value: number) => void
  format?: (value: number) => string
  className?: string
  inputClassName?: string
}

// Mastery Rank/Credits/Platinum kabi qo'lda kiritiladigan sonlar uchun
// umumiy bosib-tahrirlash naqshi (Sidebar'ning eski Mastery Rank
// mantig'idan chiqarilgan, endi 3 joyda qayta ishlatiladi).
function EditableNumber({
  value,
  onCommit,
  format,
  className = 'font-mono text-xs text-[var(--color-t1)]',
  inputClassName = 'w-20 rounded border border-[var(--color-void-border)] bg-[var(--color-void-base)] px-1 py-0.5 font-mono text-xs text-[var(--color-t1)]'
}: EditableNumberProps): React.JSX.Element {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  function start(): void {
    setDraft(String(value))
    setEditing(true)
  }

  function commit(): void {
    const parsed = Number(draft)
    if (Number.isFinite(parsed)) {
      onCommit(Math.max(0, Math.round(parsed)))
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        type="number"
        min={0}
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        onClick={(e) => e.stopPropagation()}
        className={inputClassName}
      />
    )
  }

  return (
    <button type="button" onClick={start} className={`t ${className}`}>
      {format ? format(value) : value}
    </button>
  )
}

export default EditableNumber
