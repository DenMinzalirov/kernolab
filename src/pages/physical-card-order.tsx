import { ProtectedRoute } from 'components'
import { Main } from 'features/main'

import { PhysicalCardOrder } from '../features/physical-card-order'

export function PhysicalCardOrderPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <PhysicalCardOrder />
        </Main>
      }
    />
  )
}
