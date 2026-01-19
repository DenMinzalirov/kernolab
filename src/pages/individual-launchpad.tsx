import { ProtectedRoute } from 'components'
import { Main } from 'features/main'

import { IndividualLaunchpad } from '../features/individual-launchpad'

export function IndividualLaunchpadPage() {
  return (
    <ProtectedRoute
      type='guest'
      element={
        <Main>
          <IndividualLaunchpad />
        </Main>
      }
    />
  )
}
