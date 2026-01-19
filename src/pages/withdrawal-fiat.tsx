import { ProtectedRoute } from 'components'
import { Main } from 'features/main'

import { WithdrawalBanking } from '../features/banking-new/withdrawal-banking'

export function WithdrawalFiatPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <WithdrawalBanking />
        </Main>
      }
    />
  )
}
