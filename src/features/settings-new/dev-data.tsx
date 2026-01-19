import clsx from 'clsx'

import { pages } from '../../constant'
import { globalNavigate } from '../../router/global-history'
import { getToken } from '../../utils'
import styles from './styles.module.scss'

export function DevData() {
  const userToken = getToken()

  return (
    <div className={styles.settingsItem}>
      <div className={styles.settingsItemContent}>
        <div className={styles.twoFaTitleWrap}>
          <div className={styles.settingsItemTitle}>TECHNICAL INFO</div>
        </div>

        {/*  <div className={styles.settingsItemDescription}>ACCESS TOKEN</div>*/}

        {/*  /!*<div*!/*/}
        {/*  /!*  className={styles.disableBtn}*!/*/}
        {/*  /!*  style={{ wordBreak: 'break-word', height: 'auto' }}*!/*/}
        {/*  /!*>*!/*/}
        {/*  /!*  {userToken}*!/*/}
        {/*  /!*</div>*!/*/}
      </div>
    </div>
  )
}
