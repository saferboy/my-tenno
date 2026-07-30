import { useEffect, useMemo } from 'react'
import { useMissionStore } from '../store/useMissionStore'

// TDD 5.3: "Kategoriyalar bo'yicha ajratilgan checkbox'lar ro'yxati" -
// warframe-items'da Void Fissures/Steel Path kabi o'yin-ichi teglar
// mavjud emas (bular statik xususiyat emas), shuning uchun guruhlash
// haqiqiy va barqaror ma'lumot bo'lgan planeta (systemName) bo'yicha
// qilingan.
function MissionTracker(): React.JSX.Element {
  const loading = useMissionStore((s) => s.loading)
  const nodes = useMissionStore((s) => s.nodes)
  const statusByNode = useMissionStore((s) => s.statusByNode)
  const init = useMissionStore((s) => s.init)
  const toggleCompleted = useMissionStore((s) => s.toggleCompleted)

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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[var(--color-t2)]">Yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
      <h1 className="font-display text-xl font-extrabold tracking-wide text-[var(--color-tenno-gold)] uppercase">
        Missiyalar
      </h1>

      {groups.map(({ planet, nodes: planetNodes }) => {
        const completedCount = planetNodes.filter((n) => statusByNode[n.uniqueName]?.completed).length
        return (
          <div key={planet} className="surface-base rounded-lg p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-mono text-sm font-semibold tracking-wide text-[var(--color-tenno-cyan)] uppercase">
                {planet}
              </h2>
              <span className="font-mono text-xs text-[var(--color-t3)]">
                {completedCount}/{planetNodes.length} bajarildi
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
              {planetNodes.map((node) => {
                const completed = Boolean(statusByNode[node.uniqueName]?.completed)
                return (
                  <li key={node.uniqueName}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={completed}
                        onChange={(e) => toggleCompleted(node.uniqueName, e.target.checked)}
                      />
                      <span className={completed ? 'text-[var(--color-t2)] line-through' : ''}>
                        {node.name}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

export default MissionTracker
