import { Fragment, useMemo } from 'react'
import clsx from 'clsx'

import styles from './styles.module.scss'
import type { TierProgressTrackerProps, TierStatus } from './types'
import { buildTierProgressModel, formatCurrencyValue } from './utils'

const circleStatusClass: Record<TierStatus, string> = {
  completed: styles.circleCompleted,
  current: styles.circleCurrent,
  upcoming: styles.circleUpcoming,
}

const labelStatusClass: Record<TierStatus, string> = {
  completed: styles.descriptionTitleMuted,
  current: styles.descriptionTitleCurrent,
  upcoming: styles.descriptionTitleMuted,
}

const rangeStatusClass: Record<TierStatus, string> = {
  completed: styles.descriptionRangeMuted,
  current: styles.descriptionRangeCurrent,
  upcoming: styles.descriptionRangeMuted,
}

const DEFAULT_TITLE = 'Tier Progress'
const SKELETON_TIER_IDS = ['tier-1', 'tier-2', 'tier-3'] as const
const SKELETON_DESCRIPTION_IDS = ['desc-1', 'desc-2', 'desc-3'] as const

type TierProgressTrackerSkeletonProps = {
  title: string
  className?: string
}

const TierProgressTrackerSkeleton = ({ className, title }: TierProgressTrackerSkeletonProps) => (
  <div className={clsx(styles.tierProgressTracker, className)}>
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
    </div>

    <div className={clsx(styles.track, styles.skeletonTrack)} aria-hidden='true'>
      {SKELETON_TIER_IDS.map((tierId, index) => (
        <Fragment key={tierId}>
          <div className={clsx(styles.circleWrapper, styles.skeletonCircle)} />
          {index < SKELETON_TIER_IDS.length - 1 ? (
            <div className={clsx(styles.connector, styles.skeletonConnector)} />
          ) : null}
        </Fragment>
      ))}
    </div>

    <div className={clsx(styles.descriptions, styles.skeletonDescriptions)}>
      {SKELETON_DESCRIPTION_IDS.map(descriptionId => (
        <div key={descriptionId} className={clsx(styles.descriptionItem, styles.skeletonDescriptionItem)}>
          <span className={clsx(styles.skeletonBar, styles.skeletonBarLarge)} />
          <span className={clsx(styles.skeletonBar, styles.skeletonBarSmall)} />
        </div>
      ))}
    </div>
  </div>
)

export function TierProgressTracker({
  tiers,
  currentTier,
  className,
  title = DEFAULT_TITLE,
  isLoading = false,
}: TierProgressTrackerProps) {
  const { displayedTiers, connectors } = useMemo(() => buildTierProgressModel(tiers, currentTier), [tiers, currentTier])

  if (isLoading) {
    return <TierProgressTrackerSkeleton className={className} title={title} />
  }

  return (
    <div className={clsx(styles.tierProgressTracker, className)}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </div>

      <div className={styles.track} aria-hidden='true'>
        {displayedTiers.map((tier, index) => {
          const connector = connectors[index]
          const hideOnCompact = tier.hideOnCompact
          const achievedFraction =
            connector?.type === 'active' ? Math.max(0, Math.min(connector.progressFraction ?? 0, 1)) : null
          const remainingFraction =
            connector?.type === 'active' && achievedFraction !== null ? Math.max(0, 1 - achievedFraction) : null
          const achievedLabel = connector?.type === 'active' ? formatCurrencyValue(connector.achievedAmount) : null
          const remainingLabelValue =
            connector?.type === 'active' ? formatCurrencyValue(connector.remainingAmount) : null
          const remainingLabel = remainingLabelValue ? `Left: ${remainingLabelValue}` : null

          return (
            <Fragment key={tier.name}>
              <div
                className={clsx(
                  styles.circleWrapper,
                  circleStatusClass[tier.status],
                  hideOnCompact && styles.hideOnCompact
                )}
              >
                {tier.status === 'completed' ? <span className={styles.circleCheckmark} /> : null}
              </div>

              {connector ? (
                <div
                  className={clsx(
                    styles.connector,
                    {
                      [styles.connectorCompleted]: connector.type === 'completed',
                      [styles.connectorUpcoming]: connector.type === 'upcoming',
                      [styles.connectorActive]: connector.type === 'active',
                    },
                    connector.hideOnCompact && styles.hideOnCompact
                  )}
                >
                  {connector.type === 'active' ? (
                    <>
                      {achievedFraction !== null && achievedFraction > 0 ? (
                        <span
                          className={styles.connectorAchieved}
                          style={{
                            flexGrow: achievedFraction,
                            flexBasis: 0,
                            minInlineSize: achievedLabel ? 'fit-content' : undefined,
                          }}
                        >
                          <span className={styles.connectorAchievedLabel}>{achievedLabel}</span>
                        </span>
                      ) : null}
                      {remainingFraction !== null && remainingFraction > 0 ? (
                        <span
                          className={styles.connectorRemaining}
                          style={{
                            flexGrow: remainingFraction,
                            flexBasis: 0,
                            minInlineSize: remainingLabel ? 'fit-content' : undefined,
                          }}
                        >
                          {remainingLabel}
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </div>
              ) : null}
            </Fragment>
          )
        })}
      </div>

      <div className={styles.descriptions}>
        {displayedTiers.map(tier => {
          const hideOnCompact = tier.hideOnCompact
          const showCurrentLabel = tier.status === 'current'

          return (
            <div
              key={tier.name}
              className={clsx(
                styles.descriptionItem,
                labelStatusClass[tier.status],
                hideOnCompact && styles.hideOnCompact,
                tier.compactPlacement === 'start' && styles.descriptionItemCompactStart,
                tier.compactPlacement === 'end' && styles.descriptionItemCompactEnd
              )}
            >
              <div className={styles.descriptionTitle}>
                <span className={styles.descriptionTitleText}>{tier.name}</span>
                {showCurrentLabel ? <span className={styles.descriptionCurrentLabel}>(Current)</span> : null}
              </div>
              <div className={clsx(styles.descriptionRange, rangeStatusClass[tier.status])}>{tier.rangeLabel}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
