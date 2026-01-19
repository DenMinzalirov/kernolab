import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import clsx from 'clsx'

import { AccountDetails } from './account-details'
import { ChangeEmailBiz } from './change-email-biz'
import { ChangePasswordBiz } from './change-password-biz'
import { ChangePhoneBiz } from './change-phone-biz'
import { ChangeTwoFa } from './change-two-fa'
import { DeleteAccountBiz } from './delete-account-biz'
import { Security } from './security'
import styles from './styles.module.scss'

export const ACCOUNT_PAGES = {
  ACCOUNT_DETAILS: 'ACCOUNT_DETAILS',
  SECURITY: 'SECURITY',
  APPEARANCE: 'APPEARANCE',
  CHANGE_EMAIL: 'CHANGE_EMAIL',
  CHANGE_PHONE: 'CHANGE_PHONE',
  DELETE_ACCOUNT: 'DELETE_ACCOUNT',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  CHANGE_TWO_FA: 'CHANGE_TWO_FA',
}

const isContentNav = [ACCOUNT_PAGES.ACCOUNT_DETAILS, ACCOUNT_PAGES.SECURITY]

export function AccountSettings() {
  const location = useLocation()
  const [page, setPage] = useState(location.state?.currentPage || ACCOUNT_PAGES.ACCOUNT_DETAILS)

  return (
    <>
      {isContentNav.includes(page) ? (
        <div className={clsx(styles.navContainer)}>
          <div className={styles.heading}>
            <p className={styles.headingText}>Account Settings</p>
          </div>
          <div className={styles.navContentWrap}>
            <div className={styles.headerWrap}>
              <div
                onClick={() => setPage(ACCOUNT_PAGES.ACCOUNT_DETAILS)}
                className={clsx(styles.menuItem, { [styles.menuActive]: page === ACCOUNT_PAGES.ACCOUNT_DETAILS })}
              >
                Account Details
              </div>
              <div
                onClick={() => setPage(ACCOUNT_PAGES.SECURITY)}
                className={clsx(styles.menuItem, { [styles.menuActive]: page === ACCOUNT_PAGES.SECURITY })}
              >
                Security
              </div>
            </div>

            {page === ACCOUNT_PAGES.ACCOUNT_DETAILS && <AccountDetails setPage={setPage} />}
            {page === ACCOUNT_PAGES.SECURITY && <Security setPage={setPage} />}
          </div>
        </div>
      ) : null}

      {!isContentNav.includes(page) ? (
        <div className={styles.secondaryContainer}>
          <div className={styles.secondaryContentWrap}>
            {page === ACCOUNT_PAGES.CHANGE_EMAIL && <ChangeEmailBiz setPage={setPage} />}
            {page === ACCOUNT_PAGES.CHANGE_PHONE && <ChangePhoneBiz setPage={setPage} />}
            {page === ACCOUNT_PAGES.DELETE_ACCOUNT && <DeleteAccountBiz setPage={setPage} />}

            {page === ACCOUNT_PAGES.CHANGE_PASSWORD && <ChangePasswordBiz setPage={setPage} />}
            {page === ACCOUNT_PAGES.CHANGE_TWO_FA && <ChangeTwoFa setPage={setPage} />}
          </div>
        </div>
      ) : null}
    </>
  )
}
