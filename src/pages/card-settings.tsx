import { ProtectedRoute } from 'components'
import { CardSettings } from 'features/card-settings'
import { Main } from 'features/main'

export function CardSettingsPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <CardSettings />
        </Main>
      }
    />
  )
}
