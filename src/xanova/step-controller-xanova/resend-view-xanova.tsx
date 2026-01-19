import { useEffect, useState } from 'react'
import clsx from 'clsx'

import styles from './styles.module.scss'

type Props = {
  action: () => void
}

export const ResendViewXanova = ({ action }: Props) => {
  const [timer, setTimer] = useState(30)

  useEffect(() => {
    if (timer > 0) {
      const timeout = setTimeout(() => setTimer(prev => prev - 1), 1000)
      return () => clearTimeout(timeout)
    }
  }, [timer])

  const handleAction = () => {
    if (timer <= 0) {
      setTimer(30)
      action()
    }
  }

  return (
    <div>
      <p className={styles.resendCodeLabel}>
        Have not received?{' '}
        <span onClick={handleAction} className={clsx(styles.link, timer > 0 && styles.linkDisabled)}>
          Send Again
        </span>{' '}
        {timer > 0 ? `in ${timer} second(s)` : ''}
      </p>
    </div>
  )
}
