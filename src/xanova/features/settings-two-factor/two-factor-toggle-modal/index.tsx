import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { Modal } from 'components'
import { pages } from 'constant'
import { $twoFaStatus } from 'model/two-fa'

import styles from './styles.module.scss'

export function TwoFactorToggleModal() {
  const navigate = useNavigate()
  const twoFa = useUnit($twoFaStatus)

  const handleOffOnSetup = async () => {
    navigate(pages.SETTINGS_TWO_FACTOR.path)

    Modal.close()
  }

  return (
    <>
      {twoFa ? (
        <div className={styles.container}>
          <div className={styles.titleWrap}>
            <div className={styles.title}>Turn Off 2FA?</div>
            <div className={styles.description}>
              Disabling Two-Factor Authentication (2FA) will remove an&nbsp;extra layer of&nbsp;security from your
              account.{' '}
            </div>
            <div className={styles.description}>
              With 2FA deactivated, your account will only be protected by&nbsp;your&nbsp;password. This may increase
              the risk of&nbsp;unauthorised access. If&nbsp;you are sure you want to&nbsp;proceed, please confirm
              your&nbsp;decision.
            </div>
          </div>

          <button type='button' className={'btn-xanova red'} onClick={handleOffOnSetup}>
            Turn Off
          </button>
        </div>
      ) : (
        <div className={styles.container}>
          <div className={styles.titleWrap}>
            <div className={styles.title}>Two Factor Authentication</div>
            <div className={styles.description}>To setup Two Factor Authentication please follow the instructions.</div>
          </div>

          <button type='button' className={'btn-xanova gold'} onClick={handleOffOnSetup}>
            Start Setup
          </button>
        </div>
      )}
    </>
  )
}
