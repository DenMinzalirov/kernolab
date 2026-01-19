import { ProtectedRoute } from 'components'
import { Main } from 'features/main'

import { Launchpad } from '../features/launchpad'

export function LaunchpadPage() {
  return (
    <ProtectedRoute
      type='guest'
      element={
        <Main>
          <Launchpad />
        </Main>
      }
    />
  )
}
