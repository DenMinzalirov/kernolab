import type {
  ConnectorDefinition,
  ConnectorRenderType,
  NormalizedTier,
  TierProgressCurrentTier,
  TierProgressTier,
  TierStatus,
  TierWithStatus,
} from './types'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const abbreviateValue = (value: number): string => {
  const absValue = Math.abs(value)

  if (absValue >= 1_000_000_000) {
    return `${value / 1_000_000_000}b`
  }

  if (absValue >= 1_000_000) {
    return `${value / 1_000_000}m`
  }

  if (absValue >= 1_000) {
    return `${value / 1_000}k`
  }

  return `${value}`
}

const formatRangeLabel = (minValue: number, maxValue: number): string => {
  const sanitizedMin = Math.max(minValue, 0)

  if (!Number.isFinite(maxValue)) {
    return `$${abbreviateValue(sanitizedMin)}+ sales`
  }

  const sanitizedMax = Math.max(maxValue, 0)

  return `$${abbreviateValue(sanitizedMin)} – $${abbreviateValue(sanitizedMax)} sales`
}

export const formatCurrencyValue = (value?: number): string | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return currencyFormatter.format(Math.max(value, 0))
}

const parseAmountString = (rawValue: string): number => {
  if (!rawValue) return 0

  const trimmed = rawValue.trim().toLowerCase()

  if (!trimmed) return 0

  const matcher = trimmed.match(/([-+]?[0-9]*[.,]?[0-9]+)\s*([kKmMbB]?)/)

  if (!matcher) {
    const fallback = Number(trimmed.replace(/[^0-9.-]/g, ''))
    return Number.isFinite(fallback) ? fallback : 0
  }

  const [, numericPart, suffix] = matcher
  const normalized = Number(numericPart.replace(',', '.'))

  if (!Number.isFinite(normalized)) return 0

  switch (suffix?.toLowerCase()) {
    case 'k':
      return normalized * 1_000
    case 'm':
      return normalized * 1_000_000
    case 'b':
      return normalized * 1_000_000_000
    default:
      return normalized
  }
}

const resolveBaseConnectorType = (from: TierStatus, to: TierStatus): ConnectorRenderType => {
  if (from === 'completed' && (to === 'completed' || to === 'current')) {
    return 'completed'
  }

  if ((from === 'current' && to === 'upcoming') || (from === 'completed' && to === 'upcoming')) {
    return 'active'
  }

  return 'upcoming'
}

const normalizeTiers = (tiers: TierProgressTier[]): NormalizedTier[] => {
  const sortedTiers = [...tiers]
    .map(tier => ({
      ...tier,
      thresholdValue: parseAmountString(tier.amountNeeded),
    }))
    .sort((a, b) => a.thresholdValue - b.thresholdValue)

  return sortedTiers.map((tier, index) => {
    const minValue = index === 0 ? 0 : tier.thresholdValue
    const maxValue = sortedTiers[index + 1]?.thresholdValue ?? Number.POSITIVE_INFINITY

    return {
      name: tier.name,
      amountNeeded: tier.amountNeeded,
      thresholdValue: tier.thresholdValue,
      minValue,
      maxValue,
      rangeLabel: formatRangeLabel(minValue, maxValue),
    }
  })
}

const resolveCurrentTierIndex = (
  tiers: NormalizedTier[],
  currentTier: TierProgressCurrentTier | null | undefined,
  currentAmount: number
): number => {
  const normalizedCurrentName = currentTier?.name?.trim().toLowerCase() ?? ''

  const nameMatchedIndex = normalizedCurrentName
    ? tiers.findIndex(tier => tier.name.trim().toLowerCase() === normalizedCurrentName)
    : -1

  if (nameMatchedIndex !== -1) {
    return nameMatchedIndex
  }

  const fallbackIndex = tiers.reduce((acc, tier, index) => {
    if (currentAmount >= tier.minValue) {
      return index
    }

    return acc
  }, -1)

  if (fallbackIndex !== -1) {
    return fallbackIndex
  }

  return 0
}

const buildTiersWithStatus = (
  tiers: NormalizedTier[],
  resolvedCurrentIndex: number,
  currentAmount: number
): TierWithStatus[] =>
  tiers.map((tier, index) => {
    let status: TierStatus = 'upcoming'

    if (index < resolvedCurrentIndex) {
      status = 'completed'
    } else if (index === resolvedCurrentIndex) {
      status = 'current'

      if (Number.isFinite(tier.maxValue) && currentAmount >= tier.maxValue) {
        status = 'completed'
      }
    }

    return {
      ...tier,
      status,
      order: index + 1,
      hideOnCompact: false,
    }
  })

const applyCompactVisibility = (tiers: TierWithStatus[], resolvedCurrentIndex: number): TierWithStatus[] => {
  const windowStart = Math.max(resolvedCurrentIndex - 1, 0)
  const windowEnd = Math.min(windowStart + 3, tiers.length)
  const slice = tiers.slice(windowStart, windowEnd)

  const compactVisibleIndices = new Set<number>()

  if (slice.length > 0) {
    const compactCurrentIndex = slice.findIndex(tier => tier.status === 'current')

    if (compactCurrentIndex === -1) {
      compactVisibleIndices.add(0)
      if (slice.length > 1) {
        compactVisibleIndices.add(1)
      }
    } else {
      compactVisibleIndices.add(compactCurrentIndex)

      if (compactCurrentIndex + 1 < slice.length) {
        compactVisibleIndices.add(compactCurrentIndex + 1)
      } else if (compactCurrentIndex - 1 >= 0) {
        compactVisibleIndices.add(compactCurrentIndex - 1)
      }
    }
  }

  const visibleIndices = Array.from(compactVisibleIndices).sort((a, b) => a - b)
  const firstVisibleIndex = visibleIndices[0] ?? null
  const lastVisibleIndex = visibleIndices.length > 1 ? visibleIndices[visibleIndices.length - 1] : null

  return slice.map((tier, index) => {
    const isVisibleOnCompact = compactVisibleIndices.has(index)
    const compactPlacement =
      isVisibleOnCompact && visibleIndices.length > 1
        ? index === firstVisibleIndex
          ? 'start'
          : index === lastVisibleIndex
            ? 'end'
            : undefined
        : undefined

    return {
      ...tier,
      hideOnCompact: !isVisibleOnCompact,
      compactPlacement,
    }
  })
}

const buildConnectors = (tiers: TierWithStatus[], currentAmount: number): ConnectorDefinition[] =>
  tiers.slice(0, -1).map((fromTier, index) => {
    const toTier = tiers[index + 1]
    const baseType = resolveBaseConnectorType(fromTier.status, toTier.status)

    let progressFraction: number | undefined
    let achievedAmount: number | undefined
    let remainingAmount: number | undefined

    if (baseType === 'active') {
      if (fromTier.status === 'completed') {
        progressFraction = 1
        achievedAmount = fromTier.maxValue
        remainingAmount = 0
      } else if (fromTier.status === 'current') {
        const span = fromTier.maxValue - fromTier.minValue

        if (!Number.isFinite(span) || span <= 0) {
          progressFraction = Number.isFinite(span) ? 0 : 1
          achievedAmount = currentAmount
          remainingAmount = Number.isFinite(span) ? 0 : 0
        } else {
          progressFraction = (currentAmount - fromTier.minValue) / span
          achievedAmount = currentAmount
          remainingAmount = Math.max(fromTier.maxValue - currentAmount, 0)
        }
      }
    }

    return {
      type: baseType,
      hideOnCompact: fromTier.hideOnCompact || toTier.hideOnCompact,
      progressFraction,
      achievedAmount,
      remainingAmount,
    }
  })

export const buildTierProgressModel = (
  tiers: TierProgressTier[],
  currentTier?: TierProgressCurrentTier | null
): { displayedTiers: TierWithStatus[]; connectors: ConnectorDefinition[] } => {
  if (!Array.isArray(tiers) || tiers.length === 0) {
    return { displayedTiers: [], connectors: [] }
  }

  const normalizedTiers = normalizeTiers(tiers)
  const currentAmount = parseAmountString(currentTier?.earnedAmount ?? '')
  const resolvedCurrentIndex = resolveCurrentTierIndex(normalizedTiers, currentTier, currentAmount)

  const tiersWithStatus = buildTiersWithStatus(normalizedTiers, resolvedCurrentIndex, currentAmount)
  const compactTiers = applyCompactVisibility(tiersWithStatus, resolvedCurrentIndex)
  const connectors = buildConnectors(compactTiers, currentAmount)

  return {
    displayedTiers: compactTiers,
    connectors,
  }
}
