import { useUnit } from 'effector-react'

import { CountdownTimer } from 'components/countdown-timer'
import { calculateTimeRemaining } from 'utils/calculate-time-remaining'
import { $stepUpBlockExpiration, stepUpBlockExpirationChangedEv } from 'model/step-up-block-expiration'

import styles from './styles.module.scss'

export function StepUpUnlockTimer() {
  const securityTimerData = useUnit($stepUpBlockExpiration)
  const timeRemaining = calculateTimeRemaining(securityTimerData?.expiresAt || '')

  const handleOnComplete = () => {
    stepUpBlockExpirationChangedEv(null)
  }

  return (
    <>
      {securityTimerData?.expiresAt ? (
        <div className={styles.container}>
          <CountdownTimer initialTime={timeRemaining} colorScheme='Primary' onComplete={handleOnComplete} />
        </div>
      ) : null}
    </>
  )
}
