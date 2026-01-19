import { CountdownTimer } from 'components/countdown-timer'
import { calculateTimeRemaining } from 'utils/calculate-time-remaining'

import styles from './styles.module.scss'

type Props = {
  expirationDateString: string
  closeAction?: () => void
}

export function WithdrawalsDisabledModal({ expirationDateString, closeAction }: Props) {
  const timeRemaining = calculateTimeRemaining(expirationDateString)

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div>
          <div className={styles.title}>Withdrawals Disabled</div>
          <div>
            <div className={styles.description}>
              Withdrawals are currently disabled due to recent changes to&nbsp;your&nbsp;account settings. Please wait
              for the security timer to expire.
            </div>
          </div>
        </div>

        <div className={styles.timerWrap}>
          <CountdownTimer initialTime={timeRemaining} colorScheme='Warning' />
        </div>
      </div>
    </div>
  )
}
