import { ProtectedRoute } from 'components'

import { TwoFactorAuthentication } from '../features/auth-new/two-factor-authentication'

export function TwoFactorAuthenticationPage() {
  return <ProtectedRoute type='guest' element={<TwoFactorAuthentication />} />
}
