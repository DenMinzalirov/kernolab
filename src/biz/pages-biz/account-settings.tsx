import { ProtectedRoute } from 'components'

import { AccountSettings } from '../features-biz/account-settings'
import { MainBiz } from '../main-biz'

export function AccountSettingsPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainBiz>
          <AccountSettings />
        </MainBiz>
      }
    />
  )
}
