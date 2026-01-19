import { ProtectedRoute } from 'components'
import ForgotPassword from 'features/auth-new/forgot-password'

export function ForgotPasswordPage() {
  return <ProtectedRoute type='guest' element={<ForgotPassword />} />
}
