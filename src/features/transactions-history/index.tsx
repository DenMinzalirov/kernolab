import { useLocation } from 'react-router-dom'

import { HeaderTitle } from 'components'

import { TYPE_TXN_HISTORY } from './constants'
import { getBackBtnTitle } from './helpers/get-back-btn-title'
import styles from './styles.module.scss'
import { TransactionHistoryCard } from './transaction-history-card'
import { TxnHistoryCrypto } from './txn-history-crypto'
import { TxnHistoryFiat } from './txn-history-fiat'
import { TxnHistoryStaking } from './txn-history-staking'

export function TransactionsHistory() {
  const location = useLocation()

  const transactionType = location?.state?.type || TYPE_TXN_HISTORY.CRYPTO
  const filterAssetId = location?.state?.assetId

  const isShowHeaderTitle = [TYPE_TXN_HISTORY.CRYPTO, TYPE_TXN_HISTORY.STAKING, TYPE_TXN_HISTORY.CARD].includes(
    transactionType
  )

  return (
    <div className={styles.page}>
      {isShowHeaderTitle ? (
        <HeaderTitle headerTitle={'Transactions'} showBackBtn backBtnTitle={getBackBtnTitle(transactionType)} />
      ) : null}

      {transactionType === TYPE_TXN_HISTORY.CRYPTO ? <TxnHistoryCrypto filterAssetId={filterAssetId} /> : null}
      {transactionType === TYPE_TXN_HISTORY.FIAT ? <TxnHistoryFiat /> : null}
      {transactionType === TYPE_TXN_HISTORY.STAKING ? <TxnHistoryStaking /> : null}
      {transactionType === TYPE_TXN_HISTORY.CARD ? <TransactionHistoryCard /> : null}
    </div>
  )
}
