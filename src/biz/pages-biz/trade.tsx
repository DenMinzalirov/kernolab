import { ProtectedRoute } from 'components'

import { TradeBiz } from '../features-biz/trade-biz'
import { MainBiz } from '../main-biz'

export function TradePageBiz() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainBiz>
          <TradeBiz />
        </MainBiz>
      }
    />
  )
}
