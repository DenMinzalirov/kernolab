import { ProtectedRoute } from 'components'

import { KYC } from '../features/auth-new/kyc-new'

export function KYCPage() {
  return <ProtectedRoute type='guest' element={<KYC />} />
}
