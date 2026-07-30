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

export interface MissionStatus {
  nodeUniqueName: string
  completed: boolean
  updatedAt: string
}

export type NightwaveChallengeType = 'daily' | 'weekly' | 'season'

export interface NightwaveChallenge {
  id: number
  title: string
  type: NightwaveChallengeType
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface NightwaveChallengeInput {
  title: string
  type: NightwaveChallengeType
}

export interface RivenMod {
  id: number
  weaponUniqueName: string | null
  weaponName: string
  stats: string[]
  rerollCount: number
  targetNotes: string | null
  mastered: boolean
  createdAt: string
  updatedAt: string
}

export interface RivenModInput {
  weaponUniqueName: string | null
  weaponName: string
  stats: string[]
  targetNotes: string | null
}

export interface RivenModPatch {
  stats?: string[]
  rerollCount?: number
  targetNotes?: string | null
  mastered?: boolean
}

export interface CompanionStatus {
  itemUniqueName: string
  dnaStability: number | null
  updatedAt: string
}

export interface FocusSchool {
  schoolName: string
  rank: number
  notes: string | null
  updatedAt: string
}

export interface FocusSchoolPatch {
  rank?: number
  notes?: string | null
}

export interface UserProfile {
  masteryRank: number
  updatedAt: string
}

export interface UserProfilePatch {
  masteryRank?: number
}

export interface QuestStatus {
  questUniqueName: string
  completed: boolean
  updatedAt: string
}
