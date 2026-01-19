import { ProtectedRoute } from 'components'

import { MainXanova } from '../main-xanova'
import { ComissionsXanova } from 'xanova/features/comissions-xanova'

export function ComissionsPageXanova() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainXanova>
          <ComissionsXanova />
        </MainXanova>
      }
    />
  )
}
