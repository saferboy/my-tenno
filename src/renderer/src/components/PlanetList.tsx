import type { MissionNode } from '../../../main/masterData/nodes'
import type { MissionStatus } from '../../../main/db/types'
import PlanetSphere from './PlanetSphere'
import { getPlanetPalette } from '../planetPalette'
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

// Star Chart'ning chap ustuni - "Sol System" ro'yxati, design handoff
// maketidagi CSS planeta sferasi + progress pill texnikasiga mos. Ilova
// o'yin progressiyasini kuzatmagani uchun "locked" holat yo'q - har bir
// qator doim jonli progressni ko'rsatadi.
function PlanetList({ groups, statusByNode, selectedPlanet, onSelect }: PlanetListProps): React.JSX.Element {
  const t = useT()

  return (
    <div className="flex w-[270px] shrink-0 flex-col gap-0.5 overflow-y-auto p-3" style={{ background: 'rgba(2,7,18,.4)', borderRight: '1px solid rgba(0,210,255,.14)' }}>
      <h2
        className="mx-1.5 mb-3.5 font-mono text-[10px] tracking-[4px] text-[var(--color-tenno-cyan)] uppercase"
        style={{ textShadow: '0 0 10px rgba(0,210,255,.6)' }}
      >
        ◈ {t('missionTracker.systems')}
      </h2>
      {groups.map(({ planet, nodes }) => {
        const completed = nodes.filter((n) => statusByNode[n.uniqueName]?.completed).length
        const pct = nodes.length ? Math.round((completed / nodes.length) * 100) : 0
        const isActive = planet === selectedPlanet
        const isMaxed = pct === 100
        const palette = getPlanetPalette(planet)

        return (
          <button
            key={planet}
            type="button"
            onClick={() => onSelect(planet)}
            className="t flex items-center py-2.5 pr-2.5 pl-3 text-left hover:bg-[rgba(0,210,255,.06)]"
            style={{
              background: isActive
                ? 'linear-gradient(90deg, rgba(0,210,255,.10) 0%, rgba(0,210,255,.05) 45%, transparent 100%)'
                : 'transparent',
              borderLeft: isActive ? '3px solid #00d2ff' : '3px solid transparent',
              boxShadow: isActive ? '-1px 0 10px rgba(0,210,255,.8), inset 6px 0 14px -8px rgba(0,210,255,.4)' : 'none'
            }}
          >
            <div
              className="shrink-0 rounded-full p-0.5"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(0,210,255,.4))',
                border: isActive ? '1px solid rgba(0,210,255,.6)' : '1px solid rgba(120,150,180,.15)'
              }}
            >
              <PlanetSphere palette={palette} size={36} />
            </div>
            <div className="mr-2.5 ml-3 min-w-0 flex-1">
              <div
                className="truncate text-[13px] leading-tight font-semibold tracking-[2px] uppercase"
                style={{ color: isActive ? '#eaf6ff' : '#c4d4e2' }}
              >
                {planet}
              </div>
              <div className="relative mt-1.5 h-[3px] max-w-[140px] overflow-hidden rounded-full" style={{ background: '#0c1526' }}>
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: isMaxed ? '#ffe066' : '#00d2ff',
                    boxShadow: isMaxed ? '0 0 6px #ffe066' : '0 0 6px #00d2ff'
                  }}
                />
              </div>
            </div>
            <div
              className="shrink-0 text-[14px] font-bold [font-variant-numeric:tabular-nums]"
              style={{
                color: isMaxed ? '#ffe066' : '#00d2ff',
                filter: isMaxed
                  ? 'drop-shadow(0 0 6px rgba(255,224,102,.6))'
                  : 'drop-shadow(0 0 6px rgba(0,210,255,.6))'
              }}
            >
              {pct}%
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default PlanetList
