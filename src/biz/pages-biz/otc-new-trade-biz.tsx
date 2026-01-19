import { ProtectedRoute } from 'components'

import { MainBiz } from '../main-biz'
import { OtcNewTradeBiz } from 'biz/features-biz/otc-new-trade-biz'

export function OtcNewTradePageBiz() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainBiz>
          <OtcNewTradeBiz />
        </MainBiz>
      }
    />
  )
}
