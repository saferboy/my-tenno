import { useEffect, useMemo, useRef, useState } from 'react'
import type { MissionNode } from '../../../main/masterData/nodes'
import type { MissionStatus } from '../../../main/db/types'
import PlanetSphere from './PlanetSphere'
import { getPlanetPalette } from '../planetPalette'
import { useT } from '../i18n/useT'

interface OrbitalMapProps {
  planet: string
  nodes: MissionNode[]
  statusByNode: Record<string, MissionStatus>
  selectedNode: string | null
  onSelectNode: (uniqueName: string) => void
}

const RING_CAP = 8
const CORE_RADIUS = 96
const NODE_GAP = 42

interface PositionedNode {
  node: MissionNode
  x: number
  y: number
  lineX: number
  lineY: number
  midX: number
  midY: number
  index: number
}

// Tugunlarni konsentrik halqalarga bo'lib (max 8/halqa), har biri uchun
// markazdan trigonometrik pozitsiya va ulanish chizig'i koordinatalarini
// hisoblaydi - design handoff maketining absolyut-piksel formulasi bilan
// (haqiqiy planetalar demo'dagi 14 tadan ko'p tugunga ega bo'lishi mumkin).
function layoutNodes(nodes: MissionNode[]): { positioned: PositionedNode[]; ringRadii: number[] } {
  const rings: MissionNode[][] = []
  for (let i = 0; i < nodes.length; i += RING_CAP) {
    rings.push(nodes.slice(i, i + RING_CAP))
  }
  const ringRadii = rings.map((_, i) => 180 + i * 120)

  let idx = 0
  const positioned = rings.flatMap((ringNodes, ringIdx) => {
    const r = ringRadii[ringIdx]
    const r1 = r - NODE_GAP
    const rm = (CORE_RADIUS + r1) / 2
    // Har bir halqa biroz boshqa burchakdan boshlanadi - tugunlar barcha
    // halqalarda bir xil "spitsa"larga tushib qolib, ustma-ust ko'rinishning
    // oldini oladi.
    const ringOffset = (ringIdx * Math.PI) / 8
    return ringNodes.map((node, i) => {
      const angle = (i / ringNodes.length) * 2 * Math.PI - Math.PI / 2 + ringOffset
      const ca = Math.cos(angle)
      const sa = Math.sin(angle)
      return {
        node,
        x: ca * r,
        y: sa * r,
        lineX: ca * r1,
        lineY: sa * r1,
        midX: ca * rm,
        midY: sa * rm,
        index: idx++
      }
    })
  })

  return { positioned, ringRadii }
}

function mostCommonFaction(nodes: MissionNode[]): string | null {
  const counts = new Map<string, number>()
  for (const n of nodes) {
    if (!n.faction) continue
    counts.set(n.faction, (counts.get(n.faction) ?? 0) + 1)
  }
  let best: string | null = null
  let bestCount = 0
  for (const [faction, count] of counts) {
    if (count > bestCount) {
      best = faction
      bestCount = count
    }
  }
  return best
}

const HEX_CLIP = 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)'

function OrbitalMap({ planet, nodes, statusByNode, selectedNode, onSelectNode }: OrbitalMapProps): React.JSX.Element {
  const t = useT()
  const columnRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)

  const { positioned, ringRadii } = useMemo(() => layoutNodes(nodes), [nodes])
  const outerRadius = ringRadii.length ? ringRadii[ringRadii.length - 1] : 180
  const viewBoxHalf = outerRadius + 120
  const designSize = viewBoxHalf * 2 + 60

  useEffect(() => {
    const el = columnRef.current
    if (!el) return

    const update = (): void => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (w < 50 || h < 50) return
      const s = Math.max(0.3, Math.min(1, w / designSize, h / designSize))
      setScale((prev) => (Math.abs(prev - s) > 0.01 ? s : prev))
    }

    const ro = new ResizeObserver(update)
    ro.observe(el)
    update()
    const timeout = setTimeout(update, 300)
    return () => {
      ro.disconnect()
      clearTimeout(timeout)
    }
  }, [designSize])

  const completedCount = nodes.filter((n) => statusByNode[n.uniqueName]?.completed).length
  const pct = nodes.length ? Math.round((completedCount / nodes.length) * 100) : 0
  const isMaxed = pct === 100
  const palette = getPlanetPalette(planet)
  const faction = mostCommonFaction(nodes)

  return (
    <div
      ref={columnRef}
      className="relative min-h-0 flex-1 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 90% 80% at 50% 45%, #0a1a30 0%, #030914 45%, #000 100%)'
      }}
    >
      {/* grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,210,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,210,255,.05) 1px,transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,210,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(0,210,255,.08) 1px,transparent 1px)',
          backgroundSize: '240px 240px'
        }}
      />
      <div className="scanlines pointer-events-none absolute inset-0 z-[3]" />

      <div className="pointer-events-none absolute top-5 left-7 z-[4]">
        <div
          className="font-display text-[30px] font-bold tracking-[6px] text-[var(--color-tenno-gold)] uppercase"
          style={{ textShadow: '0 0 20px rgba(255,224,102,.55), 0 0 60px rgba(255,224,102,.25)' }}
        >
          {t('sidebar.nav.missions')}
        </div>
        <div className="mt-0.5 font-mono text-[11px] tracking-[3px] whitespace-nowrap text-[#3d576f]">
          // {planet.toUpperCase()}
          {faction ? ` · ${faction.toUpperCase()}` : ''}
        </div>
      </div>

      <div className="absolute inset-0" style={{ transform: `scale(${scale})`, transformOrigin: '50% 50%' }}>
        {/* decorative spinning rings */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 rounded-full"
          style={{ width: 520, height: 520, border: '1px dashed rgba(0,210,255,.14)', animation: 'ringSpin 90s linear infinite' }}
        />
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 rounded-full"
          style={{
            width: 660,
            height: 660,
            border: '1px solid rgba(0,210,255,.07)',
            borderTop: '1px solid rgba(0,210,255,.3)',
            animation: 'ringSpinRev 140s linear infinite'
          }}
        />
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 rounded-full"
          style={{ width: 280, height: 280, border: '1px dashed rgba(255,224,102,.12)', animation: 'ringSpinRev 60s linear infinite' }}
        />

        {/* connector lines */}
        <svg
          width={viewBoxHalf * 2}
          height={viewBoxHalf * 2}
          viewBox={`${-viewBoxHalf} ${-viewBoxHalf} ${viewBoxHalf * 2} ${viewBoxHalf * 2}`}
          className="pointer-events-none absolute top-1/2 left-1/2 overflow-visible"
          style={{ transform: 'translate(-50%,-50%)', zIndex: 1 }}
        >
          <defs>
            <radialGradient id="lineGrad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={outerRadius}>
              <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#00d2ff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#005f80" stopOpacity="0.25" />
            </radialGradient>
            <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {ringRadii.map((r) => (
            <circle key={r} cx={0} cy={0} r={r} fill="none" stroke="rgba(0,210,255,.16)" strokeWidth={1} filter="url(#lineGlow)" />
          ))}
          <circle cx={0} cy={0} r={120} fill="none" stroke="rgba(0,210,255,.25)" strokeWidth={1} strokeDasharray="2 6" />
          {positioned.map(({ node, lineX, lineY, midX, midY }) => {
            const completed = Boolean(statusByNode[node.uniqueName]?.completed)
            const isSelected = node.uniqueName === selectedNode
            const lineColor = completed ? '#ffe066' : 'url(#lineGrad)'
            return (
              <g key={node.uniqueName}>
                <line
                  x1={0}
                  y1={0}
                  x2={lineX}
                  y2={lineY}
                  stroke={lineColor}
                  strokeWidth={isSelected ? 2.2 : 1.4}
                  strokeOpacity={completed ? 0.75 : isSelected ? 1 : 0.7}
                  filter="url(#lineGlow)"
                />
                <line
                  x1={0}
                  y1={0}
                  x2={lineX}
                  y2={lineY}
                  stroke="#aef3ff"
                  strokeWidth={1}
                  strokeOpacity={isSelected ? 0.9 : 0.35}
                  strokeDasharray="3 21"
                  style={{ animation: 'dashFlow 1.6s linear infinite' }}
                />
                <circle cx={midX} cy={midY} r={2.5} fill={completed ? '#ffe066' : '#00d2ff'} filter="url(#lineGlow)" />
              </g>
            )
          })}
        </svg>

        {/* center title */}
        <div
          className="pointer-events-none absolute left-1/2 z-[6] -translate-x-1/2 text-center"
          style={{ top: `calc(50% - ${outerRadius + 140}px)` }}
        >
          <div
            className="font-display text-[34px] font-bold tracking-[9px] text-white uppercase"
            style={{ textShadow: '0 0 18px rgba(0,210,255,.8), 0 0 50px rgba(0,210,255,.4)' }}
          >
            {planet}
          </div>
          <div
            className="mt-1 font-mono text-[11px] tracking-[3px]"
            style={{
              color: isMaxed ? '#ffe066' : '#00d2ff',
              filter: 'drop-shadow(0 0 6px rgba(0,210,255,.6))'
            }}
          >
            {pct}% {t('missionTracker.completed').toUpperCase()}
          </div>
        </div>

        {/* planet core */}
        <div
          className="absolute top-1/2 left-1/2 z-[4] -translate-x-1/2 -translate-y-1/2"
          style={{ animation: 'corePulse 4s ease-in-out infinite' }}
        >
          <div className="relative" style={{ width: 176, height: 176, borderRadius: '50%' }}>
            <PlanetSphere palette={palette} size={176} />
            <div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.18) 0%,transparent 42%,rgba(0,10,20,.75) 100%)' }}
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background: [
                  'radial-gradient(ellipse 45% 24% at 30% 58%, rgba(28,44,60,.7) 0 60%, transparent 72%)',
                  'radial-gradient(ellipse 34% 18% at 66% 34%, rgba(191,216,232,.35) 0 55%, transparent 70%)',
                  'radial-gradient(circle at 58% 66%, rgba(10,18,26,.8) 0 6%, transparent 7%)'
                ].join(',')
              }}
            />
            <div
              className="pointer-events-none absolute rounded-full"
              style={{
                inset: -14,
                border: '1px solid rgba(0,210,255,.4)',
                boxShadow: '0 0 18px rgba(0,210,255,.35), inset 0 0 18px rgba(0,210,255,.2)'
              }}
            />
          </div>
        </div>

        {/* mission nodes */}
        {positioned.map(({ node, x, y, index }) => {
          const completed = Boolean(statusByNode[node.uniqueName]?.completed)
          const isSelected = node.uniqueName === selectedNode
          const glowClass = isSelected ? 'hex-glow--selected' : completed ? 'hex-glow--complete' : 'hex-glow--available'
          const breathe = !completed && !isSelected

          return (
            <div
              key={node.uniqueName}
              className="absolute z-[5] flex flex-col items-center gap-2"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%,-50%)',
                animation: `nodeDrift ${5 + (index % 4)}s ease-in-out ${index * 0.4}s infinite alternate`
              }}
            >
              <button
                type="button"
                onClick={() => onSelectNode(node.uniqueName)}
                className={`hex-wrap ${glowClass} ${breathe ? 'hex-breathe' : ''}`}
                style={breathe ? { animationDuration: `${2.4 + (index % 3) * 0.5}s`, animationDelay: `${index * 0.25}s` } : undefined}
                title={node.name}
              >
                <div className={`hex-outer ${completed ? 'hex-outer--complete' : 'hex-outer--available'}`} style={{ clipPath: HEX_CLIP }}>
                  <div className={`hex-inner ${completed ? 'hex-inner--complete' : 'hex-inner--available'}`} style={{ clipPath: HEX_CLIP }}>
                    {completed ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffe066" strokeWidth="3.4" strokeLinecap="square" style={{ filter: 'drop-shadow(0 0 6px rgba(255,224,102,.9))' }}>
                        <path d="M4 12.5 9.5 18 20 6" />
                      </svg>
                    ) : (
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" strokeWidth="2.2" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 5px rgba(0,210,255,.9))' }}>
                        <rect x="4" y="11" width="16" height="10" rx="1.5" />
                        <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
              <div className="flex flex-col items-center gap-0.5">
                <div
                  className="font-display text-[12px] leading-none font-bold tracking-[2.5px] uppercase"
                  style={{
                    color: completed ? '#ffedb0' : isSelected ? '#fff' : '#a3f0ff',
                    textShadow: completed ? '0 0 10px rgba(255,224,102,.7)' : '0 0 10px rgba(0,210,255,.7)'
                  }}
                >
                  {node.name}
                </div>
                {node.type && (
                  <div
                    className="font-mono text-[8px] leading-none tracking-[2px] uppercase"
                    style={{ color: completed ? 'rgba(255,233,163,.6)' : '#5c7f9c' }}
                  >
                    {node.type}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OrbitalMap
