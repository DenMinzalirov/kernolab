import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { pages } from 'constant'

import { RequestPayoutDesktopForm } from '../request-payout-form/request-payout-desktop-form'
import styles from './styles.module.scss'
import { WithdrawHistoryTable } from './withdraw-history-table'
import { useCurrentBreakpointXanova } from 'hooks/use-current-breakpoint-xanova'
import { SummaryMetricCards } from 'xanova/components/summary-metric-cards'

export function PayoutsXanova() {
  const navigate = useNavigate()
  const { isDesktopXanova } = useCurrentBreakpointXanova()

  const goToRequestPayout = () => {
    navigate(pages.REQUEST_PAYOUT.path)
  }

  return (
    <div className={styles.container}>
      <div className={clsx(styles.header, styles.contentGutter)}>
        <h1 className={styles.title}>My Payouts</h1>
        <div className={clsx(styles.onlyTablet, styles.buttonWrap)}>
          <button className='btn-xanova gold small' onClick={goToRequestPayout}>
            Request Payout
          </button>
        </div>
      </div>

      <SummaryMetricCards classNameCardsWrap={styles.metricsCardsWrap} />

      <div className={clsx(styles.onlyMobile, styles.contentGutter, styles.mt50)}>
        <button className='btn-xanova gold big' onClick={goToRequestPayout}>
          Request Payout
        </button>
      </div>

      <div className={clsx(styles.contentWrap, styles.contentGutter)}>
        {isDesktopXanova && (
          <div className={styles.formWrap}>
            <RequestPayoutDesktopForm />
          </div>
        )}
        <div className={styles.tableWrap}>
          <WithdrawHistoryTable />
        </div>
      </div>
    </div>
  )
}
