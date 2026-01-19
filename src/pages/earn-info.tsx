import { ProtectedRoute } from 'components'
import { EarnInfo } from 'features/earn-info'
import { Main } from 'features/main'

// Only for mobile
export function EarnInfoPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <EarnInfo />
        </Main>
      }
    />
  )
}
