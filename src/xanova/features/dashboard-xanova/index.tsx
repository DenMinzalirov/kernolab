import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { calculateTimeRemaining } from 'utils/calculate-time-remaining'
import { $stepUpBlockExpiration } from 'model/step-up-block-expiration'

import { RatingChart } from '../chart'
import { MyServices } from './my-services'
import { QuickActions } from './quick-actions'
import { RecentActivity } from './recent-activity'
import { RequestPayoutPreview } from './request-payout-preview'
import styles from './styles.module.scss'
import { SummarySection } from './summary-section'
import { CountdownTimerXanova } from 'xanova/components/countdown-timer'
import { SecurityTimerModalXanova } from 'xanova/modal/security-timer-modal-xanova'

export function DashboardXanova() {
  const securityTimerData = useUnit($stepUpBlockExpiration)
  const timeRemaining = calculateTimeRemaining(securityTimerData?.expiresAt || '')

  const handleTimerClick = () => {
    Modal.open(<SecurityTimerModalXanova />, { variant: 'center' })
  }

  return (
    <div className={styles.dashboardRoot}>
      {securityTimerData?.expiresAt ? (
        <div className={styles.timerXanovaWrap} onClick={handleTimerClick}>
          <CountdownTimerXanova initialTime={timeRemaining} colorScheme='Warning' />
        </div>
      ) : null}
      <h1 className={clsx(styles.pageHeading, styles.contentGutter)}>Welcome to Xanova!</h1>

      <SummarySection />

      <section className={clsx(styles.contentGrid, styles.contentGutter)}>
        <QuickActions />

        <div className={clsx(styles.gridBlock, styles.topRightWidget)}>
          <h4 className={styles.title}>Xanova Recent Performance</h4>
          {/*<img alt='icon' src={mockChart} />*/}
          <RatingChart id='c4ccf7eb-0a53-42eb-9bfb-dea71afde140' />
        </div>

        <MyServices />

        <RecentActivity />

        <RequestPayoutPreview />
      </section>
    </div>
  )
}
