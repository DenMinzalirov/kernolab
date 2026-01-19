import { ProtectedRoute } from 'components'

import { SignUpXanova } from 'xanova/auth/sing-up'

export function SignUpPageXanova() {
  return <ProtectedRoute type='guest' element={<SignUpXanova />} />
}
