import { ProtectedRoute } from 'components'
import { Main } from 'features/main'

import { WithdrawalAssets } from '../features/withdrawal-assets'

export function WithdrawalAssetsPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <WithdrawalAssets />
        </Main>
      }
    />
  )
}
