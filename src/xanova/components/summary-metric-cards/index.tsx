import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { $membershipStatus } from 'model/membership-status'
import { $tierProgressXanova, $tierProgressXanovaLoading } from 'model/tier-progress-xanova'

import styles from './styles.module.scss'
import { useCurrentBreakpointXanova } from 'hooks/use-current-breakpoint-xanova'
import { SummaryMetricCard } from 'xanova/components/summary-metric-card'

type SummaryMetricCardsProps = {
  classNameCardsWrap?: string
  classNameCard?: string
}

export function SummaryMetricCards({ classNameCardsWrap, classNameCard }: SummaryMetricCardsProps) {
  const [tierProgress, isTierProgressLoading] = useUnit([$tierProgressXanova, $tierProgressXanovaLoading])
  const membershipStatus = useUnit($membershipStatus)
  const { isDesktopXanova } = useCurrentBreakpointXanova()

  const hasTierProgressData = tierProgress.currentTier?.earnedAmount !== ''
  const shouldShowSkeleton = isTierProgressLoading && !hasTierProgressData

  const commissionStatCards = [
    {
      key: 'available',
      title: isDesktopXanova ? 'Available Balance' : 'Available\nBalance',
      value: membershipStatus.availableCommissions,
    },
    {
      key: 'lifetime',
      title: isDesktopXanova ? 'Lifetime Sales' : 'Lifetime\nSales ',
      value: membershipStatus.lifetimeSales,
    },
    {
      key: 'earned',
      title: isDesktopXanova ? 'Commissions Earned' : 'Commissions\nEarned',
      value: membershipStatus.totalCommissionsEarned,
    },
  ]

  return (
    <div className={clsx(styles.metricsContainer, classNameCardsWrap)}>
      {commissionStatCards.map(({ key, title, value }) => (
        <SummaryMetricCard
          key={key}
          title={title}
          value={value}
          isLoading={shouldShowSkeleton}
          className={classNameCard}
        />
      ))}
    </div>
  )
}
