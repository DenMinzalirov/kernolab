import { useNavigate } from 'react-router-dom'

import { Modal } from 'components'
import { pages } from 'constant'

import styles from './styles.module.scss'

export function TwoFaRequiredModal() {
  const navigate = useNavigate()

  const handleOnClick = async () => {
    navigate(pages.SETTINGS.path)
    Modal.close()
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleWrap}>
        <div className={styles.title}>Two Factor Authentication</div>
        <div className={styles.description}>
          For security reasons, a 2FA setup is required. Please follow the instructions.
        </div>
      </div>

      <div>
        <button type='button' className={'btn-new primary'} onClick={handleOnClick}>
          Go To Settings
        </button>
      </div>
    </div>
  )
}
