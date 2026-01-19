import { ProtectedRoute } from 'components'

import { SupportBiz } from 'biz/features-biz/support-biz'
import { MainBiz } from 'biz/main-biz'

export function SupportPageBiz() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainBiz>
          <SupportBiz />
        </MainBiz>
      }
    />
  )
}
