import { ProtectedRoute } from 'components'
import { Card } from 'features/card'
import { Main } from 'features/main'

export function CardPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <Card />
        </Main>
      }
    />
  )
}
