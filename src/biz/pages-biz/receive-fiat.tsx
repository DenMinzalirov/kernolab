import { ProtectedRoute } from 'components'

import { getToken } from '../../utils'
import { ReceiveFiatBiz } from '../features-biz/receive-fiat-biz'
import { MainBiz } from '../main-biz'
import styles from './styles.module.scss'

export function ReceiveFiatPageBiz() {
  const token = getToken()

  return (
    <ProtectedRoute
      type='user'
      element={
        <MainBiz>
          <ReceiveFiatBiz />
        </MainBiz>
      }
    />
  )
}
