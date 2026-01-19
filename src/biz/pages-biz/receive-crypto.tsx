import { ProtectedRoute } from 'components'

import { ReceiveCryptoBiz } from '../features-biz/receive-crypto-biz'
import { MainBiz } from '../main-biz'
import styles from './styles.module.scss'

export function ReceiveCryptoPageBiz() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainBiz>
          <ReceiveCryptoBiz />
        </MainBiz>
      }
    />
  )
}
