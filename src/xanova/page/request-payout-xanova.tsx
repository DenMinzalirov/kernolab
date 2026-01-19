import { ProtectedRoute } from 'components'

import { MainXanova } from '../main-xanova'
import { RequestPayoutXanova } from 'xanova/features/request-payout-xanova'
export function RequestPayoutXanovaPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainXanova>
          <RequestPayoutXanova />
        </MainXanova>
      }
    />
  )
}
