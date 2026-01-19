import { ProtectedRoute } from '../../components'
import { MainBiz } from '../main-biz'
import { CryptoWalletsBiz } from 'biz/features-biz/crypto-wallets-biz'

export function CryptoWalletsPageBiz() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainBiz>
          <CryptoWalletsBiz />
        </MainBiz>
      }
    />
  )
}
