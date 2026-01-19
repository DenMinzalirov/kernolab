import { ProtectedRoute } from 'components'

import { TradesFideumOTC } from '../features-fideumOTC/trades-fideumOTC'
import { MainFideumOTC } from '../main-fideumOTC'

export function DashboardPageFideumOTC() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainFideumOTC>
          <TradesFideumOTC />
        </MainFideumOTC>
      }
    />
  )
}
