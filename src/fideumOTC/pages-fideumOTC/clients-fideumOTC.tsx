import { ProtectedRoute } from '../../components'
import { ClientsFideumOTC } from '../features-fideumOTC/clients-fideumOTC'
import { MainFideumOTC } from '../main-fideumOTC'

export function ClientsPageFideumOTC() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainFideumOTC>
          <ClientsFideumOTC />
        </MainFideumOTC>
      }
    />
  )
}
