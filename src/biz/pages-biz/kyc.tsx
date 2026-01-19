import { ProtectedRoute } from 'components'

import { KYC } from '../auth-biz/kyc-new'

export function KYCPageBiz() {
  return <ProtectedRoute type='guest' element={<KYC />} />
}
