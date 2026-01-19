import { ProtectedRoute } from 'components'

import { ForgotPasswordXanova } from 'xanova/auth/forgot-password'

export function ForgotPasswordPageXanova() {
  return <ProtectedRoute type='guest' element={<ForgotPasswordXanova />} />
}
