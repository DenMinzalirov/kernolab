import { ProtectedRoute } from '../../components'
import { MainBiz } from '../main-biz'
import { OtcBiz } from 'biz/features-biz/otc-biz'

export function OtcPageBiz() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainBiz>
          <OtcBiz />
        </MainBiz>
      }
    />
  )
}
