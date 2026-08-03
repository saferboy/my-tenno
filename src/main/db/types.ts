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

export type Locale = 'uz' | 'ru' | 'en'

export interface UserProfile {
  masteryRank: number
  credits: number
  platinum: number
  locale: Locale
  updatedAt: string
}

export interface UserProfilePatch {
  masteryRank?: number
  credits?: number
  platinum?: number
  locale?: Locale
}

export interface QuestStatus {
  questUniqueName: string
  completed: boolean
  updatedAt: string
}

export interface WishlistItem {
  id: number
  itemUniqueName: string | null
  itemName: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface WishlistItemInput {
  itemUniqueName: string | null
  itemName: string
  notes: string | null
}

export interface WishlistItemPatch {
  notes?: string | null
}
