import { ProtectedRoute } from 'components'

import { MainBiz } from '../main-biz'
import { OtcDepositBiz } from 'biz/features-biz/otc-deposit-biz'

export function OtcDepositPageBiz() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainBiz>
          <OtcDepositBiz />
        </MainBiz>
      }
    />
  )
}
