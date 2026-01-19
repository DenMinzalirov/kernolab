import { HeaderTitle, ProtectedRoute } from 'components'
import { Main } from 'features/main'
import { Otc } from 'features/otc'

import { getToken } from '../utils'
import styles from './styles.module.scss'

export function OtcPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          {/* REFACTOR move wrapper to layout */}
          <div className={styles.wrap}>
            <HeaderTitle headerTitle='OTC' />
            <Otc />
          </div>
        </Main>
      }
    />
  )
}
