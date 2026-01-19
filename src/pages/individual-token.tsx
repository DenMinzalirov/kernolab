import { ProtectedRoute } from 'components'
import { Main } from 'features/main'

import { IndividualToken } from '../features/individual-token'

export function IndividualTokenPage() {
  return (
    <ProtectedRoute
      type='guest'
      element={
        <Main>
          <IndividualToken />
        </Main>
      }
    />
  )
}
