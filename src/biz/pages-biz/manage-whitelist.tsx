import { ProtectedRoute } from '../../components'
import { MainBiz } from '../main-biz'
import { ManageWhitelistBiz } from 'biz/features-biz/manage-whitelist-biz'

export function ManageWhitelistPageBiz() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainBiz>
          <ManageWhitelistBiz />
        </MainBiz>
      }
    />
  )
}
