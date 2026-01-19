import { useNavigate } from 'react-router-dom'

import { pages } from 'constant'

import { MyBalancesBiz } from '../my-balances-biz'
import styles from './styles.module.scss'
import { TxnOtcTableBiz } from './txn-otc-table-biz'

export function OtcBiz() {
  const navigate = useNavigate()
  //TODO добавить филтр для OTC
  return (
    <div className={styles.mainContainer}>
      <MyBalancesBiz />
      <div className={styles.otcWrap}>
        <div className={styles.otcHeader}>
          <label className={styles.otcHeaderLabel}>OTC Transactions</label>

          <div className={styles.reportBtnWrap}>
            <button onClick={() => navigate(pages.OTC_NEW_TRADE.path)} className='btn-with-icon-biz light-blue'>
              <span className={styles.hideMdAndDown}> Request New Trade +</span>
              <span className={styles.showInlineMdAndDown}> New +</span>
            </button>
          </div>
        </div>

        <TxnOtcTableBiz />
      </div>
    </div>
  )
}
