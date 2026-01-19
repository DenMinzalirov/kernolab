import { useEffect, useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { calculateTimeRemaining } from 'utils/calculate-time-remaining'
import { handleError } from 'utils/error-handler'
import { $stepUpBlockExpiration, stepUpBlockExpirationFx } from 'model/step-up-block-expiration'

import styles from './styles.module.scss'
import { CountdownTimerXanova } from 'xanova/components/countdown-timer'

type Props = {
  customClose?: () => void
  enableFetch?: boolean
}

export function SecurityTimerModalXanova({ customClose, enableFetch = false }: Props) {
  const securityTimerData = useUnit($stepUpBlockExpiration)
  const timeRemaining = calculateTimeRemaining(securityTimerData?.expiresAt || '')

  const [isLoading, setIsLoading] = useState(false)

  const getStepUpBlockInfo = async () => {
    setIsLoading(true)
    try {
      await stepUpBlockExpirationFx()
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (enableFetch) {
      getStepUpBlockInfo()
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <div className={styles.title}>Security Timer Activated</div>
        <div className={styles.description}>
          A 24-hour security timer is active due to a recent change in&nbsp;your&nbsp;account settings. Withdrawals are
          temporarily disabled until the&nbsp;timer expires.
        </div>
      </div>

      <div className={styles.actions}>
        {isLoading && securityTimerData?.expiresAt ? (
          <div className={clsx('spinner-border', styles.height30)} />
        ) : (
          <CountdownTimerXanova initialTime={timeRemaining} colorScheme='Warning' />
        )}
      </div>
    </div>
  )
}
