import { ProtectedRoute } from '../../components'
import { StartRep } from '../features/start-rep'
import { MainXanova } from '../main-xanova'

export function StartRepPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainXanova>
          <StartRep />
        </MainXanova>
      }
    />
  )
}
