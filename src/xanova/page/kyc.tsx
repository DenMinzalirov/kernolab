import { ProtectedRoute } from 'components'

import { KYCXanova } from '../auth/kyc'

export function KYCPageXanova() {
  return <ProtectedRoute type='guest' element={<KYCXanova />} />
}
