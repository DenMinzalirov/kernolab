import { ProtectedRoute } from '../../components'
import { MainBiz } from '../main-biz'
import { FiatWalletsBiz } from 'biz/features-biz/fiat-wallets-biz'

export function FiatWalletsPageBiz() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainBiz>
          <FiatWalletsBiz />
        </MainBiz>
      }
    />
  )
}
