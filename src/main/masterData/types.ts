export interface WarframeItem {
  uniqueName: string
  name: string
  category: string
  type?: string
  imageName?: string
  [key: string]: unknown
}

export interface MasterDataPayload {
  dataVersion: string
  items: WarframeItem[]
}
