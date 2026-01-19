import { ProtectedRoute } from 'components'
import { Main } from 'features/main'
import { Whitelist } from 'features/whitelist'
import { WhitelistManage } from 'features/whitelist-manage'

export function WhitelistManagePage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <WhitelistManage />
        </Main>
      }
    />
  )
}
