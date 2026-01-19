import { ProtectedRoute } from 'components'
import { LaunchpadPurchase } from 'features/launchpad-purchase'
import { Main } from 'features/main'

export function LaunchpadPurchasePage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <LaunchpadPurchase />
        </Main>
      }
    />
  )
}
