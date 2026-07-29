import Items from 'warframe-items'

export interface MissionNode {
  uniqueName: string
  name: string
  systemName: string
}

let cached: MissionNode[] | null = null

// TDD 5.3: Mission Tracker uchun star chart node'lari - Arsenal'ning
// qurol/frame ro'yxatidan alohida, faqat shu maqsad uchun yuklanadi.
export function getNodes(): MissionNode[] {
  if (cached) return cached

  const options = { category: ['Node'] } as ConstructorParameters<typeof Items>[0]
  const instance = new Items(options) as unknown as Array<{
    uniqueName: string
    name: string
    systemName: string
  }>

  cached = instance.map((node) => ({
    uniqueName: node.uniqueName,
    name: node.name,
    systemName: node.systemName
  }))

  return cached
}
