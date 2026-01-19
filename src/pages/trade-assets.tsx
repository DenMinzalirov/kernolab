import { ProtectedRoute } from 'components'
import { Main } from 'features/main'

import { TradeAssets } from '../features/trade-assets'

export function TradeAssetsPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <TradeAssets />
        </Main>
      }
    />
  )
}
