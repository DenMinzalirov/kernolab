import { ProtectedRoute } from 'components'

import { SettingsUserPasswordXanova } from 'xanova/features/settings-user-password'
import { MainXanova } from 'xanova/main-xanova'

export function SettingsUserPasswordPageXanova() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainXanova>
          <SettingsUserPasswordXanova />
        </MainXanova>
      }
    />
  )
}
