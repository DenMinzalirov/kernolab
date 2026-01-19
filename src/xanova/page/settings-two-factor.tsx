import { ProtectedRoute } from 'components'

import { SettingsTwoFactorXanova } from 'xanova/features/settings-two-factor'
import { MainXanova } from 'xanova/main-xanova'

export function SettingsTwoFactorPageXanova() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainXanova>
          <SettingsTwoFactorXanova />
        </MainXanova>
      }
    />
  )
}
