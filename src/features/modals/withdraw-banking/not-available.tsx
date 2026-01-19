import { NavLink, useNavigate } from 'react-router-dom'

import { termsOfUseLink } from 'config'
import dangerOrange from 'assets/icons/danger-orange.svg'

import { Modal } from '../../../components'
import { pages } from '../../../constant'
import styles from './styles.module.scss'

export function WithdrawalNotAvailable() {
  const navigate = useNavigate()

  const openDeposit = () => {
    navigate(pages.DEPOSIT_FIAT.path)
    Modal.close()
  }

  return (
    <div className={styles.notAvailableModalContainer}>
      <img className={styles.attentionIconNotAvailable} alt='' src={dangerOrange} />
      <div className={styles.textWrap}>
        <div className={styles.modalTitle}>Withdrawal Not Available</div>
        <div className={styles.transferDescription}>
          According to the{' '}
          <NavLink to={termsOfUseLink()} target='_blank' className={styles.terms}>
            Terms & Conditions
          </NavLink>{' '}
          to be able to withdraw your funds to any bank account, you must first make a deposit with the desired bank
          account. You can withdraw your funds to the bank accounts from which deposits have been made.
        </div>
      </div>

      <button
        onClick={() => {
          openDeposit()
        }}
        className='btn-new primary red'
        // style={{ backgroundColor: '#FF3B30' }}
      >
        Deposit
      </button>
    </div>
  )
}
