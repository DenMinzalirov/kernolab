import { ProtectedRoute } from 'components'

import { MainFideumOTC } from '../main-fideumOTC'
import { AccountSettingsFideumOTC } from 'fideumOTC/features-fideumOTC/account-settings-fideumOTC'

export function AccountSettingsPageFideumOTC() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainFideumOTC>
          <AccountSettingsFideumOTC />
        </MainFideumOTC>
      }
    />
  )
}
