import { ProtectedRoute } from 'components'

import { ConfirmationCode } from '../features/auth-new/confirmation-code'

export function ConfirmationCodePage() {
  return <ProtectedRoute type='guest' element={<ConfirmationCode />} />
}
