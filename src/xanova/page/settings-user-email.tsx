import { ProtectedRoute } from 'components'

import { MainXanova } from '../main-xanova'
import { SettingsUserEmailXanova } from 'xanova/features/settings-user-email'

export function SettingsUserEmailPageXanova() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainXanova>
          <SettingsUserEmailXanova />
        </MainXanova>
      }
    />
  )
}
