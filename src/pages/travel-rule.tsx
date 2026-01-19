import { ProtectedRoute } from 'components'
import { Main } from 'features/main'
import { TransactionsHistory } from 'features/transactions-history'
import { TravelRule } from 'features/travel-rule'

export function TravelRulePage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <TravelRule />
        </Main>
      }
    />
  )
}
