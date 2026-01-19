import { ProtectedRoute } from 'components'
import { Main } from 'features/main'
import { TransactionsHistory } from 'features/transactions-history'

export function TransactionsHistoryPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <TransactionsHistory />
        </Main>
      }
    />
  )
}
