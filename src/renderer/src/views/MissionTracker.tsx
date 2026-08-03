import { useEffect, useMemo, useState } from 'react'
import { useMissionStore } from '../store/useMissionStore'
import PlanetList from '../components/PlanetList'
import OrbitalMap from '../components/OrbitalMap'
import MissionInfoPanel from '../components/MissionInfoPanel'
import { useT } from '../i18n/useT'

// TDD 5.3: "Kategoriyalar bo'yicha ajratilgan checkbox'lar ro'yxati" -
// warframe-items'da Void Fissures/Steel Path kabi o'yin-ichi teglar
// mavjud emas (bular statik xususiyat emas), shuning uchun guruhlash
// haqiqiy va barqaror ma'lumot bo'lgan planeta (systemName) bo'yicha
// qilingan. Ko'rinish - reference dizayndagi orbital Star Chart
// (chap: planeta ro'yxati, markaz: hexagon tugunlar, o'ng: tafsilot paneli).
function MissionTracker(): React.JSX.Element {
  const loading = useMissionStore((s) => s.loading)
  const nodes = useMissionStore((s) => s.nodes)
  const statusByNode = useMissionStore((s) => s.statusByNode)
  const init = useMissionStore((s) => s.init)
  const toggleCompleted = useMissionStore((s) => s.toggleCompleted)
  const t = useT()

  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  useEffect(() => {
    init()
  }, [init])

  const groups = useMemo(() => {
    const byPlanet = new Map<string, typeof nodes>()
    for (const node of nodes) {
      const list = byPlanet.get(node.systemName) ?? []
      list.push(node)
      byPlanet.set(node.systemName, list)
    }
    return Array.from(byPlanet.entries())
      .map(([planet, planetNodes]) => ({
        planet,
        nodes: planetNodes.slice().sort((a, b) => a.name.localeCompare(b.name))
      }))
      .sort((a, b) => a.planet.localeCompare(b.planet))
  }, [nodes])

  useEffect(() => {
    if (!selectedPlanet && groups.length) {
      setSelectedPlanet(groups[0].planet)
    }
  }, [groups, selectedPlanet])

  const overallCompleted = useMemo(
    () => nodes.filter((n) => statusByNode[n.uniqueName]?.completed).length,
    [nodes, statusByNode]
  )

  const currentGroup = groups.find((g) => g.planet === selectedPlanet) ?? null
  const currentNode = currentGroup?.nodes.find((n) => n.uniqueName === selectedNode) ?? null
  const planetCompleted = currentGroup
    ? currentGroup.nodes.filter((n) => statusByNode[n.uniqueName]?.completed).length
    : 0

  function handleSelectPlanet(planet: string): void {
    setSelectedPlanet(planet)
    setSelectedNode(null)
  }

  function handleToggle(): void {
    if (!currentNode) return
    toggleCompleted(currentNode.uniqueName, !statusByNode[currentNode.uniqueName]?.completed)
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[var(--color-t2)]">{t('app.loading')}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1">
      <PlanetList
        groups={groups}
        statusByNode={statusByNode}
        selectedPlanet={selectedPlanet}
        onSelect={handleSelectPlanet}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-8">
        <h1 className="mb-6 font-display text-xl font-extrabold tracking-wide text-[var(--color-tenno-gold)] uppercase">
          {t('sidebar.nav.missions')}
        </h1>
        {currentGroup && (
          <OrbitalMap
            planet={currentGroup.planet}
            nodes={currentGroup.nodes}
            statusByNode={statusByNode}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
          />
        )}
      </div>

      <MissionInfoPanel
        node={currentNode}
        completed={Boolean(currentNode && statusByNode[currentNode.uniqueName]?.completed)}
        onToggle={handleToggle}
        planetCompleted={planetCompleted}
        planetTotal={currentGroup?.nodes.length ?? 0}
        overallCompleted={overallCompleted}
        overallTotal={nodes.length}
      />
    </div>
  )
}

export default MissionTracker
