import { ProtectedRoute } from '../../components'
import { MainBiz } from '../main-biz'
import { TxnHistoryBiz } from 'biz/features-biz/txn-history-biz'

export function TransactionsPageBiz() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainBiz>
          <TxnHistoryBiz />
        </MainBiz>
      }
    />
  )
}
