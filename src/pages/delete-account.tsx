import { ProtectedRoute } from 'components'
import DeleteAccount from 'features/delete-account'
import { Main } from 'features/main'

export function DeleteAccountPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <DeleteAccount />
        </Main>
      }
    />
  )
}
