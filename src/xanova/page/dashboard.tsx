import { ProtectedRoute } from 'components'

import { DashboardXanova } from '../features/dashboard-xanova'
import { MainXanova } from '../main-xanova'

export function DashboardPageXanova() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainXanova>
          <DashboardXanova />
        </MainXanova>
      }
    />
  )
}
