import { ProtectedRoute } from 'components'

import { SignUpBiz } from 'biz/auth-biz/sing-up'

export function SignUpPageBiz() {
  return <ProtectedRoute type='guest' element={<SignUpBiz />} />
}
