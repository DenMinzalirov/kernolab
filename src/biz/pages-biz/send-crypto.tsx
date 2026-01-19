import { ProtectedRoute } from 'components'

import { getToken } from '../../utils'
import { SendCryptoBiz } from '../features-biz/send-crypto-biz'
import { MainBiz } from '../main-biz'
import styles from './styles.module.scss'

export function SendCryptoPageBiz() {
  const token = getToken()

  return (
    <ProtectedRoute
      type='user'
      element={
        <MainBiz>
          <SendCryptoBiz />
        </MainBiz>
      }
    />
  )
}
