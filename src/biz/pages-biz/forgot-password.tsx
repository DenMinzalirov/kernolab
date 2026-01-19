import { ProtectedRoute } from 'components'

import { ForgotPasswordBiz } from 'biz/auth-biz/forgot-password'

export function ForgotPasswordPageBiz() {
  return <ProtectedRoute type='guest' element={<ForgotPasswordBiz />} />
}
