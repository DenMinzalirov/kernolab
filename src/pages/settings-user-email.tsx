import { ProtectedRoute } from 'components'
import { Main } from 'features/main'

import { SettingsUserEmail } from '../features/settings-new/settings-user-email'

export function SettingsUserEmailPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <SettingsUserEmail />
        </Main>
      }
    />
  )
}
