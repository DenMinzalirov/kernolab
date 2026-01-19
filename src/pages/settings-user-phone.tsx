import { ProtectedRoute } from 'components'
import { Main } from 'features/main'

import { SettingsUserPhone } from '../features/settings-new/settings-user-phone'

export function SettingsUserPhonePage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <SettingsUserPhone />
        </Main>
      }
    />
  )
}
