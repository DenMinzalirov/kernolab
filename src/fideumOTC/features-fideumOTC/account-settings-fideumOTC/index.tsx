import { useState } from 'react'
import clsx from 'clsx'

import { AccountDetails } from './account-details'
import { ChangeEmailBiz } from './change-email-biz'
import { ChangePasswordBiz } from './change-password-biz'
import { ChangeTwoFa } from './change-two-fa'
import styles from './styles.module.scss'

export const ACCOUNT_PAGES_FIDEUM_OTC = {
  ACCOUNT_DETAILS: 'ACCOUNT_DETAILS',
  CHANGE_EMAIL: 'CHANGE_EMAIL',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  CHANGE_TWO_FA: 'CHANGE_TWO_FA',
}

export function AccountSettingsFideumOTC() {
  const [page, setPage] = useState(ACCOUNT_PAGES_FIDEUM_OTC.ACCOUNT_DETAILS)

  return (
    <>
      {[ACCOUNT_PAGES_FIDEUM_OTC.ACCOUNT_DETAILS].includes(page) ? (
        <div className={clsx(styles.navContainer)}>
          <div className={styles.navContentWrap}>
            <div className={styles.headerWrap}>
              <div className={clsx(styles.headingText)}>Account Settings</div>
            </div>

            <AccountDetails setPage={setPage} />
          </div>
        </div>
      ) : null}

      {![ACCOUNT_PAGES_FIDEUM_OTC.ACCOUNT_DETAILS].includes(page) ? (
        <div className={styles.secondaryContainer}>
          <div className={styles.secondaryContentWrap}>
            {page === ACCOUNT_PAGES_FIDEUM_OTC.CHANGE_EMAIL && <ChangeEmailBiz setPage={setPage} />}
            {page === ACCOUNT_PAGES_FIDEUM_OTC.CHANGE_PASSWORD && <ChangePasswordBiz setPage={setPage} />}
            {page === ACCOUNT_PAGES_FIDEUM_OTC.CHANGE_TWO_FA && <ChangeTwoFa setPage={setPage} />}
          </div>
        </div>
      ) : null}
    </>
  )
}
