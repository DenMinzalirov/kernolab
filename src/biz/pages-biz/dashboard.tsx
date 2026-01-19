import { ProtectedRoute } from 'components'

import { getToken } from '../../utils'
import { DashboardBiz } from '../dashboard-biz'
import { MainBiz } from '../main-biz'

export function DashboardPageBiz() {
  const token = getToken()

  return (
    <ProtectedRoute
      type='user'
      element={
        <MainBiz>
          <DashboardBiz />
        </MainBiz>
      }
    />
  )
}
