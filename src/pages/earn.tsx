import { ProtectedRoute } from 'components'
import { Main } from 'features/main'

import { Earn } from '../features/earn-new'

export function EarnPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <Earn />
        </Main>
      }
    />
  )
}
