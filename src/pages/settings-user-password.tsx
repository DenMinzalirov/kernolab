import { ProtectedRoute } from 'components'
import { Main } from 'features/main'

import { SettingsUserPassword } from '../features/settings-new/settings-user-password'

export function SettingsUserPasswordPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <SettingsUserPassword />
        </Main>
      }
    />
  )
}
