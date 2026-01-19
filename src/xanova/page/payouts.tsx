import { ProtectedRoute } from 'components'

import { MainXanova } from '../main-xanova'
import { PayoutsXanova } from 'xanova/features/payouts-xanova'
export function PayoutsPageXanova() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainXanova>
          <PayoutsXanova />
        </MainXanova>
      }
    />
  )
}
