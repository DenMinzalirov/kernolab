import { ProtectedRoute } from 'components'
import { Main } from 'features/main'

import { DepositBanking } from '../features/banking-new/deposit-banking'

export function DepositFiatPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <DepositBanking />
        </Main>
      }
    />
  )
}
