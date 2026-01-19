import { ProtectedRoute } from 'components'
import { Main } from 'features/main'
import Support from 'features/support-new'

export function SupportPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <Support />
        </Main>
      }
    />
  )
}
