import type { CSSProperties } from 'react'
import { useMemo } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { $tierProgressXanova, $tierProgressXanovaLoading } from 'model/tier-progress-xanova'

import { formatCurrencyValue } from '../tier-progress-tracker/utils'
import styles from './styles.module.scss'
import type { TierProgressCurrentTier, TierProgressTier } from 'xanova/components/tier-progress-tracker/types'

type TierProgressState = {
  tiers: TierProgressTier[]
  currentTier?: TierProgressCurrentTier | null
}

const DEFAULT_LABELS: [string, string] = ['', '']
const SKELETON_HEADER_IDS = ['current-tier', 'next-tier'] as const

const resolveProgressData = (tierProgress?: TierProgressState | null) => {
  const tiers = tierProgress?.tiers ?? []
  const currentTier = tierProgress?.currentTier ?? null
  const currentAmount = currentTier?.earnedAmount ? +currentTier.earnedAmount : 0

  if (tiers.length === 0) {
    return {
      currentAmount,
      targetAmount: currentAmount,
      tierLabels: [currentTier?.name ?? '', ''] as [string, string],
    }
  }

  const normalizedTiers = tiers
    .map(tier => ({
      name: tier.name,
      threshold: tier.amountNeeded ? +tier.amountNeeded : 0,
    }))
    .sort((a, b) => a.threshold - b.threshold)

  const normalizedCurrentName = currentTier?.name?.trim().toLowerCase() ?? ''

  let resolvedIndex = normalizedCurrentName
    ? normalizedTiers.findIndex(tier => tier.name.trim().toLowerCase() === normalizedCurrentName)
    : -1

  if (resolvedIndex === -1) {
    resolvedIndex = normalizedTiers.reduce((acc, tier, index) => {
      if (currentAmount >= tier.threshold) {
        return index
      }

      return acc
    }, -1)
  }

  if (resolvedIndex === -1) {
    resolvedIndex = 0
  }

  const currentTierData = normalizedTiers[resolvedIndex] ?? normalizedTiers[0]
  const nextTierData = normalizedTiers[resolvedIndex + 1]

  const targetAmount = nextTierData ? nextTierData.threshold : Math.max(currentAmount, currentTierData?.threshold ?? 0)

  return {
    currentAmount,
    targetAmount,
    tierLabels: [
      currentTierData?.name ?? currentTier?.name ?? '',
      nextTierData?.name ?? currentTierData?.name ?? '',
    ] as [string, string],
  }
}

const ProgressTierBarSkeleton = () => (
  <div className={styles.progressTier}>
    <div className={clsx(styles.progressTierHeader, styles.skeletonHeader)}>
      {SKELETON_HEADER_IDS.map(headerId => (
        <span key={headerId} className={clsx(styles.skeletonBar, styles.skeletonHeaderBar)} />
      ))}
    </div>
    <div className={clsx(styles.progressBar, styles.skeletonProgressBar)}>
      <span className={clsx(styles.skeletonSegment, styles.skeletonSegmentAchieved)} />
      <span className={clsx(styles.skeletonSegment, styles.skeletonSegmentRemaining)} />
    </div>
  </div>
)

export function ProgressTierBar() {
  const [tierProgress, isTierProgressLoading] = useUnit([$tierProgressXanova, $tierProgressXanovaLoading])
  const hasTierProgressData = tierProgress.currentTier?.earnedAmount !== ''
  const shouldShowSkeleton = isTierProgressLoading && !hasTierProgressData

  const { currentAmount, targetAmount, tierLabels } = resolveProgressData(tierProgress)

  const normalizedTarget = Math.max(targetAmount, 0)
  const currentAmountProgress = Math.max(currentAmount, 0)
  const achievedAmount = Math.min(currentAmountProgress, normalizedTarget)
  const remainingAmount = Math.max(normalizedTarget - achievedAmount, 0)
  const hasRemainingAmount = remainingAmount > 0
  const totalAmount = achievedAmount + remainingAmount

  const displayCurrentAmount = formatCurrencyValue(currentAmount)
  const displayRemainingAmount = formatCurrencyValue(remainingAmount)

  const { achievedStyles, remainingStyles } = useMemo(() => {
    const baseStyles: CSSProperties = { flexShrink: 1, flexBasis: 0, minInlineSize: 'fit-content' }

    if (!hasRemainingAmount || totalAmount === 0) {
      return {
        achievedStyles: { ...baseStyles, flexGrow: 1 },
        remainingStyles: undefined,
      }
    }

    return {
      achievedStyles: { ...baseStyles, flexGrow: achievedAmount },
      remainingStyles: { ...baseStyles, flexGrow: remainingAmount },
    }
  }, [achievedAmount, hasRemainingAmount, remainingAmount, totalAmount])

  if (shouldShowSkeleton) {
    return <ProgressTierBarSkeleton />
  }

  return (
    <div className={styles.progressTier}>
      <div className={styles.progressTierHeader}>
        <p className={styles.progressTierLabel}>{tierLabels[0] ?? DEFAULT_LABELS[0]}</p>
        {tierLabels[1] ? <p className={styles.progressTierLabel}>{tierLabels[1]}</p> : null}
      </div>
      <div className={styles.progressBar}>
        <div className={clsx(styles.progressSegment, styles.progressSegmentAchieved)} style={achievedStyles}>
          Achieved: {displayCurrentAmount}
        </div>
        {hasRemainingAmount && remainingStyles && (
          <div className={clsx(styles.progressSegment, styles.progressSegmentLeft)} style={remainingStyles}>
            Left: {displayRemainingAmount}
          </div>
        )}
      </div>
    </div>
  )
}
