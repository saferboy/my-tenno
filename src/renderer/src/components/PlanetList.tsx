import type { MissionNode } from '../../../main/masterData/nodes'
import type { MissionStatus } from '../../../main/db/types'
import CompletionRing from './CompletionRing'
import { useT } from '../i18n/useT'

interface PlanetGroup {
  planet: string
  nodes: MissionNode[]
}

interface PlanetListProps {
  groups: PlanetGroup[]
  statusByNode: Record<string, MissionStatus>
  selectedPlanet: string | null
  onSelect: (planet: string) => void
}

// Star Chart'ning chap ustuni - "Sol System" ro'yxati, reference
// dizayndagi planeta+progress qatorlariga o'xshash.
function PlanetList({ groups, statusByNode, selectedPlanet, onSelect }: PlanetListProps): React.JSX.Element {
  const t = useT()

  return (
    <div className="flex w-60 shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-[var(--color-void-border)] p-3">
      <h2 className="px-1 pb-1 font-mono text-[10px] font-semibold tracking-widest text-[var(--color-t3)] uppercase">
        {t('missionTracker.systems')}
      </h2>
      {groups.map(({ planet, nodes }) => {
        const completed = nodes.filter((n) => statusByNode[n.uniqueName]?.completed).length
        const pct = nodes.length ? (completed / nodes.length) * 100 : 0
        const isActive = planet === selectedPlanet

        return (
          <button
            key={planet}
            type="button"
            onClick={() => onSelect(planet)}
            className={`t hover-glow flex items-center gap-2.5 rounded-md border px-2.5 py-2 text-left ${
              isActive
                ? 'border-[var(--color-tenno-cyan)] bg-[rgba(78,205,196,0.06)]'
                : 'border-transparent hover:border-[var(--color-void-border)]'
            }`}
          >
            <CompletionRing percent={pct} size={28} strokeWidth={2.5} />
            <div className="min-w-0 flex-1">
              <div
                className={`truncate text-[12.5px] font-semibold ${
                  isActive ? 'text-[var(--color-t1)]' : 'text-[var(--color-t2)]'
                }`}
              >
                {planet}
              </div>
              <div className="font-mono text-[9.5px] text-[var(--color-t3)]">
                {completed}/{nodes.length}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default PlanetList
