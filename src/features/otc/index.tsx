import { useRef } from 'react'

import { TxnOtc } from 'features/transactions-history/txn-otc'

import { OtcNewRequest } from './otc-new-request'
import styles from './styles.module.scss'

export function Otc() {
  return (
    <div className={styles.mainContainer}>
      <div className={styles.mainContent}>
        <OtcNewRequest />
        <TxnOtc />
      </div>
    </div>
  )
}
