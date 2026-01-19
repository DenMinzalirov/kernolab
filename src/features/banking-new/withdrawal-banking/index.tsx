import { HeaderTitle } from '../../../components'
import { DepositBankingModal, WithdrawBankingModal } from '../../modals'
import styles from '../../settings-new/settings-user-password/styles.module.scss'

export function WithdrawalBanking() {
  return (
    <div
      // className={styles.container}
      className='page-container-pairs'
    >
      {/*<div className={styles.headerWrap}>*/}
      <HeaderTitle headerTitle={'Withdraw'} showBackBtn backBtnTitle={'Banking'} />
      {/*</div>*/}
      <div className={styles.contentWrap}>
        <WithdrawBankingModal />
      </div>
    </div>
  )
}
