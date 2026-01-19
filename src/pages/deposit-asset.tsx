import { ProtectedRoute } from 'components'
import { DepositAsset } from 'features/deposit-asset'
import { Main } from 'features/main'

export function DepositAssetPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <DepositAsset />
        </Main>
      }
    />
  )
}
