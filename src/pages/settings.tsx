import { ProtectedRoute } from 'components'
import { Main } from 'features/main'
import Settings from 'features/settings-new'

export function SettingsPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <Settings />
        </Main>
      }
    />
  )
}
