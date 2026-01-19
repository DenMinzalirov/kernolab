import { ProtectedRoute } from 'components'
import { Main } from 'features/main'
import { NewSupercharge } from 'features/new-supercharge'

export function NewSuperchargePage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <NewSupercharge />
        </Main>
      }
    />
  )
}
