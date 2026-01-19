import { ProtectedRoute } from '../../components'
import { MainBiz } from '../main-biz'
import { WhitelistBiz } from 'biz/features-biz/whitelist-biz'

export function WhitelistPageBiz() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainBiz>
          <WhitelistBiz />
        </MainBiz>
      }
    />
  )
}
