import { ProtectedRoute } from 'components'
import { Banking } from 'features/banking-new'
import { Main } from 'features/main'

export function BankingPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <Banking />
        </Main>
      }
    />
  )
}
