import { Modal } from 'components'

import styles from './styles.module.scss'

type Props = {
  customClose?: () => void
}

export function TwoFactorOffSuccessModal({ customClose }: Props) {
  const handleClose = async () => {
    customClose ? customClose() : Modal.close()
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleWrap}>
        <div className={styles.title}>2FA Turned Off</div>
        <div className={styles.description}>Your account is now secured with your password only.</div>
      </div>

      <button type='button' className={'btn-xanova gold'} onClick={handleClose}>
        Close
      </button>
    </div>
  )
}
