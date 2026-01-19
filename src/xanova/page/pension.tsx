import { ProtectedRoute } from 'components'

import { MainXanova } from '../main-xanova'
import { PensionXanova } from 'xanova/features/pension'
export function PensionPageXanova() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainXanova>
          <PensionXanova />
        </MainXanova>
      }
    />
  )
}
