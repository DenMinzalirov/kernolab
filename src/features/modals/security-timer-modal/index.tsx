import { useEffect, useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { CountdownTimer } from 'components/countdown-timer'
import { calculateTimeRemaining } from 'utils/calculate-time-remaining'
import { handleError } from 'utils/error-handler'
import { $stepUpBlockExpiration, stepUpBlockExpirationFx } from 'model/step-up-block-expiration'

import styles from './styles.module.scss'

export function SecurityTimerModal() {
  const securityTimerData = useUnit($stepUpBlockExpiration)

  const [isLoading, setIsLoading] = useState(false)
  const timeRemaining = calculateTimeRemaining(securityTimerData?.expiresAt || '')

  const getStepUpBlockInfo = async () => {
    setIsLoading(true)
    try {
      await stepUpBlockExpirationFx()

      // if (!securityTimerData?.expiresAt) {
      //   Modal.close()
      // }
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getStepUpBlockInfo()
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div>
          <div className={styles.title}>Security Timer Activated</div>
          <div>
            <div className={styles.description}>
              A 24-hour security timer is active due to a recent change in your account settings. Withdrawals are
              temporarily disabled until the timer expires.
            </div>
          </div>
        </div>

        <div className={styles.timerWrap}>
          {isLoading && securityTimerData?.expiresAt ? (
            <div className={clsx('spinner-border', styles.height40)} />
          ) : (
            <CountdownTimer initialTime={timeRemaining} colorScheme='Primary' />
          )}
        </div>
      </div>
    </div>
  )
}
