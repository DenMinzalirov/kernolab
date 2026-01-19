export type TierStatus = 'completed' | 'current' | 'upcoming'

export type TierProgressTier = {
  name: string
  amountNeeded: string
}

export type TierProgressCurrentTier = {
  name: string
  earnedAmount: string
}

export type NormalizedTier = TierProgressTier & {
  thresholdValue: number
  minValue: number
  maxValue: number
  rangeLabel: string
}

export type TierWithStatus = NormalizedTier & {
  status: TierStatus
  order: number
  hideOnCompact: boolean
  compactPlacement?: 'start' | 'end'
}

export type ConnectorRenderType = 'completed' | 'active' | 'upcoming'

export type ConnectorDefinition = {
  type: ConnectorRenderType
  hideOnCompact: boolean
  progressFraction?: number
  achievedAmount?: number
  remainingAmount?: number
}

export type TierProgressTrackerProps = {
  tiers: TierProgressTier[]
  currentTier?: TierProgressCurrentTier | null
  className?: string
  title?: string
  isLoading?: boolean
}
