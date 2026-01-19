import { useNavigate } from 'react-router-dom'

import { Modal } from 'components'
import { pages } from 'constant'
import backArrow from 'assets/icons/back-arrow.svg'

import checkmarkIcon from '../../icon-xanova/checkmark-icon.svg'
import { AuthLayoutXanova } from '../auth-layout'
import { MembershipFormXanova } from './form'
import styles from './styles.module.scss'

export function MembershipXanova() {
  const navigate = useNavigate()

  const handleOnClick = () => {
    Modal.open(<MembershipFormXanova />, { variant: 'center' })
  }

  const handleBack = () => {
    navigate(pages.SignIn.path)
  }

  return (
    <AuthLayoutXanova>
      <div className={styles.container}>
        <button onClick={handleBack} className='btn-with-icon-xanova back absolute'>
          <img alt={'Back'} src={backArrow} />
          Back
        </button>
        <h1 className={styles.title}>Activate Your Membership</h1>
        <div className={styles.content}>
          <div className={styles.flexVerticaGap5}>
            <p className={styles.description}>one-time purchase</p>
            <p className={styles.bigDescription}>3000$</p>
          </div>
          <div className={styles.flexVerticaGap12}>
            <p className={styles.description}>
              <img className={styles.icon} src={checkmarkIcon} alt={'checkmark'} />
              Unlimited access to all core features
            </p>
            <p className={styles.description}>
              <img className={styles.icon} src={checkmarkIcon} alt={'checkmark'} />
              Priority support
            </p>
          </div>
          <button className='btn-xanova gold' onClick={handleOnClick}>
            Purchase Now
          </button>
        </div>
      </div>
    </AuthLayoutXanova>
  )
}
