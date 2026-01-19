import { useState } from 'react'

import styles from './styles.module.scss'

type Props = {
  action: () => void
}

export const ResendViewBiz = ({ action }: Props) => {
  const [isResend, setIsResend] = useState(false) //TODO add resend text

  const handleAction = () => {
    setIsResend(true)
    action()
  }
  return (
    <div className={styles.resendWrap}>
      <span className={styles.resendText}>Have not received? </span>
      <span
        onClick={async () => {
          handleAction()
        }}
        className={styles.resendLink}
      >
        Send again
      </span>
    </div>
  )
}
