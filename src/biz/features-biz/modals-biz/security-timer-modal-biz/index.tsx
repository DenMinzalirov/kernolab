import { useEffect, useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { CountdownTimer } from 'components/countdown-timer'
import { calculateTimeRemaining } from 'utils/calculate-time-remaining'
import { handleError } from 'utils/error-handler'
import { $stepUpBlockExpiration, stepUpBlockExpirationFx } from 'model/step-up-block-expiration'

import { isFideumOTC } from '../../../../config'
import styles from './styles.module.scss'

type Props = {
  customClose?: () => void
  enableFetch?: boolean
}

export function SecurityTimerModalBiz({ customClose, enableFetch = false }: Props) {
  const securityTimerData = useUnit($stepUpBlockExpiration)
  const timeRemaining = calculateTimeRemaining(securityTimerData?.expiresAt || '')

  const [isLoading, setIsLoading] = useState(false)

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
    if (enableFetch) {
      getStepUpBlockInfo()
    }

    if (isFideumOTC) {
      Modal.close()
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div>
          {isLoading && securityTimerData?.expiresAt ? (
            <div className={clsx('spinner-border', styles.height30)} />
          ) : (
            <CountdownTimer initialTime={timeRemaining} colorScheme='Warning' />
          )}
        </div>

        <div className={styles.titleWrap}>
          <div className={styles.title}>Withdrawals and Edits Disabled</div>
          <div className={styles.description}>
            Withdrawals and whitelist edits are temporarily disabled following recent changes to your account settings.
            Please wait for the security timer to expire.
          </div>
        </div>
      </div>

      <button
        type='button'
        className={clsx('btn-biz red')}
        onClick={() => (customClose ? customClose() : Modal.close())}
      >
        Got It
      </button>
    </div>
  )
}
