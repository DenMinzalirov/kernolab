import { ProtectedRoute } from 'components'

import { getToken } from '../../utils'
import { SendFiatBiz } from '../features-biz/send-fiat-biz'
import { MainBiz } from '../main-biz'
import styles from './styles.module.scss'

export function SendFiatPageBiz() {
  const token = getToken()

  return (
    <ProtectedRoute
      type='user'
      element={
        <MainBiz>
          <SendFiatBiz />
        </MainBiz>
      }
    />
  )
}
