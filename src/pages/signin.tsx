import { ProtectedRoute } from 'components'

import { SignIn } from '../features/auth-new/sign-in'

export function SigninPage() {
  return <ProtectedRoute type='guest' element={<SignIn />} />
}
