import { ProtectedRoute } from 'components'

import { MainXanova } from '../main-xanova'
import { AccountSettingsXanova } from 'xanova/features/account-settings'

export function AccountSettingsPageXanova() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainXanova>
          <AccountSettingsXanova />
        </MainXanova>
      }
    />
  )
}
