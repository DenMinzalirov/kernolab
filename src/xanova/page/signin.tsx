import { ProtectedRoute } from 'components'

import { SignInXanova } from '../auth/sign-in'

export function SignInPageXanova() {
  return <ProtectedRoute type='guest' element={<SignInXanova />} />
}
