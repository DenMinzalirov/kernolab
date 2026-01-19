import { ProtectedRoute } from 'components'
import { Main } from 'features/main'
import { Whitelist } from 'features/whitelist'

export function WhitelistPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <Whitelist />
        </Main>
      }
    />
  )
}
