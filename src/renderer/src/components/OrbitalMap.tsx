import { Check } from 'lucide-react'
import type { MissionNode } from '../../../main/masterData/nodes'
import type { MissionStatus } from '../../../main/db/types'

interface OrbitalMapProps {
  planet: string
  nodes: MissionNode[]
  statusByNode: Record<string, MissionStatus>
  selectedNode: string | null
  onSelectNode: (uniqueName: string) => void
}

const RING_CAP = 8

interface PositionedNode {
  node: MissionNode
  x: number
  y: number
}

// Tugunlarni bitta halqaga sig'maganda konsentrik halqalarga bo'lib,
// har bir tugun uchun markazdan trigonometrik pozitsiya hisoblaydi
// (foiz-asosidagi koordinatalar - kvadrat konteynerga mos).
function layoutNodes(nodes: MissionNode[]): PositionedNode[] {
  const rings: MissionNode[][] = []
  for (let i = 0; i < nodes.length; i += RING_CAP) {
    rings.push(nodes.slice(i, i + RING_CAP))
  }

  return rings.flatMap((ringNodes, ringIdx) => {
    const radius = 22 + ringIdx * 15
    return ringNodes.map((node, i) => {
      const angle = (i / ringNodes.length) * 2 * Math.PI - Math.PI / 2
      return {
        node,
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle)
      }
    })
  })
}

// Star Chart'ning markaziy xaritasi - planeta o'rtada, missiya tugunlari
// atrofida hexagon shaklida, ulanish chiziqlari bilan.
function OrbitalMap({ planet, nodes, statusByNode, selectedNode, onSelectNode }: OrbitalMapProps): React.JSX.Element {
  const positioned = layoutNodes(nodes)

  return (
    <div className="mx-auto aspect-square w-full max-w-[620px] shrink-0 self-center">
      <div className="relative h-full w-full">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {positioned.map(({ node, x, y }) => {
            const completed = Boolean(statusByNode[node.uniqueName]?.completed)
            return (
              <line
                key={node.uniqueName}
                x1={50}
                y1={50}
                x2={x}
                y2={y}
                stroke={completed ? 'rgba(201,168,76,0.35)' : 'rgba(78,205,196,0.18)'}
                strokeWidth={0.3}
              />
            )
          })}
        </svg>

        <div className="glow-cyan absolute top-1/2 left-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 border-[var(--color-tenno-cyan-dim)] bg-[var(--color-void-base)] px-2 text-center">
          <span className="font-display text-xs leading-tight font-extrabold break-words text-[var(--color-t1)] uppercase">
            {planet}
          </span>
        </div>

        {positioned.map(({ node, x, y }) => {
          const completed = Boolean(statusByNode[node.uniqueName]?.completed)
          const isSelected = node.uniqueName === selectedNode
          return (
            <button
              key={node.uniqueName}
              type="button"
              onClick={() => onSelectNode(node.uniqueName)}
              title={node.name}
              className={`hex-node absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center ${
                completed ? 'hex-node--complete' : 'hex-node--available'
              } ${isSelected ? 'hex-node--selected' : ''}`}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {completed ? (
                <Check size={16} className="text-[var(--color-tenno-gold)]" />
              ) : (
                <span className="font-mono text-[8.5px] text-[var(--color-t2)]">
                  {node.name.slice(0, 3).toUpperCase()}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OrbitalMap
