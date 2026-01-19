import { useNavigate } from 'react-router-dom'

import { Modal } from 'components'
import { pages } from 'constant'
import { hasTravelRuleModalBeenShownEv } from 'model/travel-rule-transactions'
import dangerOrange from 'assets/icons/danger-orange.svg'

import styles from './styles.module.scss'

export function TravelRuleVerificationModal() {
  const navigate = useNavigate()
  const handleOnClick = () => {
    navigate(pages.TRANSACTIONS_HISTORY.path)
    hasTravelRuleModalBeenShownEv(true)
    Modal.close()
  }

  return (
    <div className={styles.main}>
      <img className={styles.attentionIcon} alt='' src={dangerOrange} />
      <div className={styles.content}>
        <div className={styles.titleWrap}>
          <div className={styles.title}>Verification Required</div>
          <div className={styles.description}>
            Under the “Travel Rule” regulation, you are required to&nbsp;provide information about the digital wallet
            addresses you use to receive deposits or make withdrawals. This information is necessary to access your
            funds. Please submit the required details as soon as possible.
          </div>
        </div>

        <button onClick={handleOnClick} className={'btn-new red'}>
          Submit&nbsp;Wallet&nbsp;Information
        </button>
      </div>
    </div>
  )
}
