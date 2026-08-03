import { Info, ListChecks, Trophy } from 'lucide-react'
import type { MissionNode } from '../../../main/masterData/nodes'
import Panel from './Panel'
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

// Star Chart'ning o'ng ustuni - design handoff maketidagi uch shisha-panel
// ("Mission Info"/"Status Overview"/"Overall Progress"). "Rewards Tracker"
// o'rniga haqiqiy umumiy progress ko'rsatiladi - ilova mukofot ma'lumotlarini
// kuzatmaydi.
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
  const overallPct = overallTotal ? Math.round((overallCompleted / overallTotal) * 100) : 0

  return (
    <div
      className="flex w-[310px] shrink-0 flex-col gap-3.5 overflow-y-auto p-3.5"
      style={{ background: 'rgba(2,7,18,.4)', borderLeft: '1px solid rgba(0,210,255,.14)' }}
    >
      <Panel title={t('missionTracker.missionInfo')} icon={Info}>
        {node ? (
          <div className="flex flex-col gap-0.5">
            <h3
              className="text-[22px] font-bold tracking-[3px] text-[#eaf6ff]"
              style={{ textShadow: '0 0 14px rgba(0,210,255,.5)' }}
            >
              {node.name.toUpperCase()}
            </h3>
            {node.type && (
              <p className="mb-3.5 font-mono text-[11px] tracking-[2px] text-[var(--color-tenno-gold)]">
                {node.type}
              </p>
            )}
            <div className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1.5 font-mono text-[11px]">
              {(node.minEnemyLevel !== undefined || node.maxEnemyLevel !== undefined) && (
                <>
                  <span className="text-[#4a5d72]">{t('missionTracker.level').toUpperCase()}</span>
                  <span className="text-[#9fdcff]">
                    {node.minEnemyLevel ?? '?'}-{node.maxEnemyLevel ?? '?'}
                  </span>
                </>
              )}
              {node.faction && (
                <>
                  <span className="text-[#4a5d72]">FACTION</span>
                  <span className="text-[#9fdcff]">{node.faction.toUpperCase()}</span>
                </>
              )}
              <span className="text-[#4a5d72]">STATUS</span>
              <span style={{ color: completed ? '#ffe066' : '#5c7185' }}>
                {completed ? t('missionTracker.completed').toUpperCase() : t('missionTracker.available').toUpperCase()}
              </span>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="clip-corner-sm mt-4 py-2.5 text-center font-mono text-[11px] tracking-[2px] transition-[filter] duration-150 hover:brightness-125"
              style={{
                border: completed ? '1px solid rgba(255,224,102,.5)' : '1px solid rgba(0,210,255,.5)',
                background: completed ? 'rgba(255,224,102,.1)' : 'rgba(0,210,255,.1)',
                color: completed ? '#ffe066' : '#00d2ff',
                textShadow: '0 0 8px currentColor'
              }}
            >
              {completed ? `✕ ${t('missionTracker.markIncomplete').toUpperCase()}` : `✔ ${t('missionTracker.markComplete').toUpperCase()}`}
            </button>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-[#5c7185]">{t('missionTracker.selectNode')}</p>
        )}
      </Panel>

      <Panel title={t('missionTracker.statusOverview')} icon={ListChecks}>
        <div className="flex justify-between py-1 text-[15px]">
          <span className="text-[#8fa3b8]">{t('missionTracker.completedCount')}</span>
          <span
            className="[font-variant-numeric:tabular-nums] text-[16px] font-bold text-[var(--color-tenno-cyan)]"
            style={{ filter: 'drop-shadow(0 0 6px rgba(0,210,255,.6))' }}
          >
            {planetCompleted}/{planetTotal}
          </span>
        </div>
        <div className="flex justify-between border-t border-[rgba(0,210,255,.08)] py-1 text-[15px]">
          <span className="text-[#8fa3b8]">{t('missionTracker.remainingCount')}</span>
          <span
            className="[font-variant-numeric:tabular-nums] text-[16px] font-bold text-[#eaf6ff]"
            style={{ filter: 'drop-shadow(0 0 6px rgba(0,210,255,.4))' }}
          >
            {Math.max(0, planetTotal - planetCompleted)}
          </span>
        </div>
      </Panel>

      <Panel title={t('missionTracker.overallProgress')} icon={Trophy} tone="gold">
        <div className="mb-2.5 flex items-baseline justify-between">
          <span
            className="[font-variant-numeric:tabular-nums] text-[15px] font-semibold text-[#9fdcff]"
            style={{ filter: 'drop-shadow(0 0 6px rgba(0,210,255,.6))' }}
          >
            {overallCompleted}/{overallTotal}
          </span>
          <span
            className="text-[26px] font-bold text-[var(--color-tenno-gold)]"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,224,102,.7))' }}
          >
            {overallPct}%
          </span>
        </div>
        <div className="relative h-1.5" style={{ background: 'rgba(0,210,255,.08)', border: '1px solid rgba(0,210,255,.15)' }}>
          <div
            className="progress-bar absolute inset-0 transition-[width] duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </Panel>
    </div>
  )
}

export default MissionInfoPanel
