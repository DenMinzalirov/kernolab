import { ProtectedRoute } from 'components'

import { MainXanova } from '../main-xanova'
import { WalletXanova } from 'xanova/features/wallet-xanova'

export function WalletPageXanova() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainXanova>
          <WalletXanova />
        </MainXanova>
      }
    />
  )
}
