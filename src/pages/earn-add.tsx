import { ProtectedRoute } from 'components'
import { EarnAdd } from 'features/earn-add'
import { Main } from 'features/main'

export function EarnAddPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <EarnAdd />
        </Main>
      }
    />
  )
}
