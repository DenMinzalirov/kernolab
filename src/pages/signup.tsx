import { ProtectedRoute } from 'components'

import { SignUp } from '../features/auth-new/sign-up'

export function SignupPage() {
  return <ProtectedRoute type='guest' element={<SignUp />} />
}
