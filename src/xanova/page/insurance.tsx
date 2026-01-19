import { ProtectedRoute } from 'components'

import { InsuranceXanova } from '../features/insurance-xanova'
import { MainXanova } from '../main-xanova'

export function InsurancePageXanova() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainXanova>
          <InsuranceXanova />
        </MainXanova>
      }
    />
  )
}
