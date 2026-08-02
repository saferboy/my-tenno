import { useEffect, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useQuestStore } from '../store/useQuestStore'
import { questOrderIndex } from '../questOrder'
import ProgressBar from '../components/ProgressBar'
import { useT } from '../i18n/useT'

// Kvest ro'yxatining o'zi useAppStore.items'dan (category === 'Quests')
// olinadi. Ba'zi kvestlar nomi bir xil bo'lgan ikkita alohida yozuvga ega
// (masalan, sortie versiyasi) - foydalanuvchiga bir xil kvestni ikki marta
// ko'rsatmaslik uchun nom bo'yicha dedup qilinadi.
function QuestTimeline(): React.JSX.Element {
  const items = useAppStore((s) => s.items)
  const loading = useQuestStore((s) => s.loading)
  const statusByQuest = useQuestStore((s) => s.statusByQuest)
  const init = useQuestStore((s) => s.init)
  const toggleCompleted = useQuestStore((s) => s.toggleCompleted)
  const t = useT()

  useEffect(() => {
    init()
  }, [init])

  const quests = useMemo(() => {
    const seenNames = new Set<string>()
    const deduped = items.filter((item) => {
      if (item.category !== 'Quests') return false
      if (seenNames.has(item.name)) return false
      seenNames.add(item.name)
      return true
    })
    return deduped.sort((a, b) => questOrderIndex(a.name) - questOrderIndex(b.name))
  }, [items])

  const completedCount = quests.filter((q) => statusByQuest[q.uniqueName]?.completed).length
  const pct = quests.length ? completedCount / quests.length : 0

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[var(--color-t2)]">{t('app.loading')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-extrabold tracking-wide text-[var(--color-tenno-gold)] uppercase">
          {t('sidebar.nav.quests')}
        </h1>
        <span className="font-mono text-xs text-[var(--color-tenno-cyan)]">
          {completedCount}/{quests.length}
        </span>
      </div>

      <ProgressBar value={pct} />

      <div className="relative flex flex-col gap-3 pl-6">
        <div className="absolute top-1 bottom-1 left-[9px] w-px bg-[var(--color-void-border)]" />
        {quests.map((quest, index) => {
          const completed = Boolean(statusByQuest[quest.uniqueName]?.completed)
          const description = typeof quest.description === 'string' ? quest.description : ''
          return (
            <div key={quest.uniqueName} className="relative">
              <div
                className={`t absolute top-4 -left-6 h-2.5 w-2.5 rounded-full border-2 ${
                  completed
                    ? 'border-[var(--color-ok)] bg-[var(--color-ok)]'
                    : 'border-[var(--color-void-border)] bg-[var(--color-void-black)]'
                }`}
              />
              <label className="surface-base t flex cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-[var(--color-void-surface)]">
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(e) => toggleCompleted(quest.uniqueName, e.target.checked)}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[var(--color-t3)]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-sm font-semibold ${completed ? 'text-[var(--color-t2)] line-through' : 'text-[var(--color-t1)]'}`}
                    >
                      {quest.name}
                    </span>
                  </div>
                  {description && (
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--color-t3)]">{description}</p>
                  )}
                </div>
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default QuestTimeline
