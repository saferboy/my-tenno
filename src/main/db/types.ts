export interface ItemStatus {
  itemUniqueName: string
  owned: boolean
  maxed: boolean
  sold: boolean
  rank: number | null
  notes: string | null
  updatedAt: string
}

export interface ItemStatusPatch {
  owned?: boolean
  maxed?: boolean
  sold?: boolean
  rank?: number | null
  notes?: string | null
}
