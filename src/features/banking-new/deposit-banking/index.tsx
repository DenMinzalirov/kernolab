import { HeaderTitle } from '../../../components'
import { DepositBankingModal } from '../../modals'
import styles from '../../settings-new/settings-user-password/styles.module.scss'

export function DepositBanking() {
  return (
    <div
      // className={styles.container}
      className='page-container-pairs'
    >
      {/*<div className={styles.headerWrap}>*/}
      <HeaderTitle headerTitle={'Top Up'} showBackBtn backBtnTitle={'Banking'} />
      {/*</div>*/}
      <div className={styles.contentWrap}>
        <DepositBankingModal />
      </div>
    </div>
  )
}
