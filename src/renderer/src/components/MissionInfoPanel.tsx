import { Info, ListChecks, Trophy, Check } from 'lucide-react'
import type { MissionNode } from '../../../main/masterData/nodes'
import Panel from './Panel'
import ProgressBar from './ProgressBar'
import { useT } from '../i18n/useT'

interface MissionInfoPanelProps {
  node: MissionNode | null
  completed: boolean
  onToggle: () => void
  planetCompleted: number
  planetTotal: number
  overallCompleted: number
  overallTotal: number
}

// Star Chart'ning o'ng ustuni - "Mission Info"/"Status Overview" reference
// kartalari + "Rewards Tracker" o'rniga haqiqiy umumiy progress ("Overall
// Progress") - ilova mukofot ma'lumotlarini kuzatmagani uchun fabrika
// qilinmagan.
function MissionInfoPanel({
  node,
  completed,
  onToggle,
  planetCompleted,
  planetTotal,
  overallCompleted,
  overallTotal
}: MissionInfoPanelProps): React.JSX.Element {
  const t = useT()
  const overallPct = overallTotal ? overallCompleted / overallTotal : 0

  return (
    <div className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-[var(--color-void-border)] p-4">
      <Panel title={t('missionTracker.missionInfo')} icon={Info}>
        {node ? (
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-base font-extrabold text-[var(--color-t1)]">{node.name}</h3>
            <p className="font-mono text-[10px] tracking-wide text-[var(--color-t3)] uppercase">
              {node.systemName}
            </p>
            {(node.minEnemyLevel !== undefined || node.maxEnemyLevel !== undefined) && (
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-t3)]">{t('missionTracker.level')}</span>
                <span className="font-mono text-[var(--color-t1)]">
                  {node.minEnemyLevel ?? '?'}–{node.maxEnemyLevel ?? '?'}
                </span>
              </div>
            )}
            {Boolean(node.masteryReq) && (
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-t3)]">{t('missionTracker.masteryReq')}</span>
                <span className="font-mono text-[var(--color-t1)]">{node.masteryReq}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onToggle}
              className={`t hover-glow mt-1 flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold ${
                completed
                  ? 'border-[var(--color-tenno-gold)] text-[var(--color-tenno-gold)]'
                  : 'border-[var(--color-tenno-cyan)] text-[var(--color-tenno-cyan)]'
              }`}
            >
              <Check size={13} />
              {completed ? t('missionTracker.markIncomplete') : t('missionTracker.markComplete')}
            </button>
          </div>
        ) : (
          <p className="text-xs text-[var(--color-t3)]">{t('missionTracker.selectNode')}</p>
        )}
      </Panel>

      <Panel title={t('missionTracker.statusOverview')} icon={ListChecks}>
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-[var(--color-t3)]">{t('missionTracker.completedCount')}</span>
            <span className="font-mono text-[var(--color-tenno-cyan)]">
              {planetCompleted}/{planetTotal}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-t3)]">{t('missionTracker.remainingCount')}</span>
            <span className="font-mono text-[var(--color-t1)]">
              {Math.max(0, planetTotal - planetCompleted)}
            </span>
          </div>
        </div>
      </Panel>

      <Panel title={t('missionTracker.overallProgress')} icon={Trophy}>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between font-mono text-xs">
            <span className="text-[var(--color-t3)]">
              {overallCompleted}/{overallTotal}
            </span>
            <span className="text-[var(--color-tenno-gold)]">{Math.round(overallPct * 100)}%</span>
          </div>
          <ProgressBar value={overallPct} />
        </div>
      </Panel>
    </div>
  )
}

export default MissionInfoPanel
