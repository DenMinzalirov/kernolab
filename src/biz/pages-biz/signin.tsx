import { ProtectedRoute } from 'components'

import { SignInBiz } from '../auth-biz/sign-in'

export function SignInPageBiz() {
  return <ProtectedRoute type='guest' element={<SignInBiz />} />
}
