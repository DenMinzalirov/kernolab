import { ProtectedRoute } from 'components'
import { Main } from 'features/main'

import { SettingsTwoFactor } from '../features/settings-new/settings-two-factor'

export function SettingsTwoFactorPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <SettingsTwoFactor />
        </Main>
      }
    />
  )
}
