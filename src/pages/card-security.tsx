import { ProtectedRoute } from 'components'
import { CardSecurity } from 'features/card-security'
import { Main } from 'features/main'

export function CardSecurityPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <CardSecurity />
        </Main>
      }
    />
  )
}
