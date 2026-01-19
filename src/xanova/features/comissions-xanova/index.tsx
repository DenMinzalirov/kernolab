import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { $membershipStatus } from 'model/membership-status'
import { $tierProgressXanova, $tierProgressXanovaLoading } from 'model/tier-progress-xanova'

import { CommissionStatCard } from './commission-stat-card'
import { ComissionsTable } from './commissions-table'
import { ReferralProgram } from './referral-program'
import styles from './styles.module.scss'
import { SummaryMetricCards } from 'xanova/components/summary-metric-cards'
import { TierProgressTracker } from 'xanova/components/tier-progress-tracker'

export function ComissionsXanova() {
  const [tierProgress, isTierProgressLoading] = useUnit([$tierProgressXanova, $tierProgressXanovaLoading])
  const membershipStatus = useUnit($membershipStatus)

  const hasTierProgressData = tierProgress.currentTier?.earnedAmount !== ''
  const shouldShowSkeleton = isTierProgressLoading && !hasTierProgressData

  const commissionStatCards = [
    // только для Commission в desktop версии
    {
      key: 'available',
      title: 'Available\nBalance',
      value: membershipStatus.availableCommissions,
      gridClass: styles.gridCardTwo,
    },
    {
      key: 'lifetime',
      title: 'Lifetime\nSales ',
      value: membershipStatus.lifetimeSales,
      gridClass: styles.gridCardThree,
    },
    {
      key: 'earned',
      title: 'Commissions\nEarned',
      value: membershipStatus.totalCommissionsEarned,
      gridClass: styles.gridCardFour,
    },
  ]

  return (
    <div className={styles.container}>
      <h1 className={clsx(styles.title, styles.contentGutter)}>My Commissions</h1>

      <div className={styles.onlyTableAndMobile}>
        <SummaryMetricCards />
      </div>

      <div className={styles.referralProgressLayout}>
        <div className={styles.referralProgramBox}>
          <ReferralProgram />
        </div>
        <div className={styles.tierProgressTrackerWrap}>
          <TierProgressTracker
            tiers={tierProgress.tiers}
            currentTier={tierProgress.currentTier}
            isLoading={shouldShowSkeleton}
          />
        </div>
      </div>

      <div className={styles.commissionsContent}>
        <div className={clsx(styles.gridCard, styles.gridCardOne)}>
          <ComissionsTable />
        </div>

        {commissionStatCards.map(({ key, title, value, gridClass }) => (
          /* только для Commission в desktop версии */
          <div key={`grid-${key}`} className={clsx(styles.gridCard, gridClass)}>
            <CommissionStatCard
              title={title}
              value={value}
              className={styles.mobileCommissionStatsCard}
              isLoading={shouldShowSkeleton}
            />
          </div>
        ))}
        <div className={clsx(styles.gridCard, styles.gridCardFive)}>
          <ReferralProgram />
        </div>
      </div>
    </div>
  )
}
