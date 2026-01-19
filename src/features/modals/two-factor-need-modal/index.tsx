import { useNavigate } from 'react-router-dom'

import { Modal } from 'components'

import { pages } from '../../../constant'
import styles from './styles.module.scss'

export function TwoFaNeedModal() {
  const navigate = useNavigate()

  const handleOffOnSetup = async () => {
    navigate(pages.SETTINGS_TWO_FACTOR.path)

    Modal.close()
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleWrap}>
        <div className={styles.title}>Enable 2FA to Continue</div>
        <div className={styles.description}>
          To access this feature, please enable 2FA for&nbsp;added security. This is required to proceed with
          withdrawals and other sensitive actions.
        </div>
      </div>

      <div>
        <button type='button' className={`btn-new primary red`} onClick={handleOffOnSetup}>
          Turn On 2FA
        </button>

        <button type='button' className='btn-new transparent' onClick={() => Modal.close()} style={{ marginTop: 12 }}>
          Cancel
        </button>
      </div>
    </div>
  )
}
