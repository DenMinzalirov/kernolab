import { Dispatch, SetStateAction, useEffect } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { $userInfo, getUserInfoFx } from '../../../model/user-info'
import { ACCOUNT_PAGES } from './index'
import styles from './styles.module.scss'
import { useCurrentBreakpoint } from 'hooks/use-current-breakpoint'

type Props = {
  setPage: Dispatch<SetStateAction<string>>
}

export function AccountDetails({ setPage }: Props) {
  const userInfo = useUnit($userInfo)
  const { isMobileBiz } = useCurrentBreakpoint()

  useEffect(() => {
    if (!userInfo.email) {
      getUserInfoFx()
    }
  }, [])

  const handleChangeEmail = () => {
    setPage(ACCOUNT_PAGES.CHANGE_EMAIL)
  }

  const handleChangePhone = () => {
    setPage(ACCOUNT_PAGES.CHANGE_PHONE)
  }

  const handleDelete = () => {
    setPage(ACCOUNT_PAGES.DELETE_ACCOUNT)
  }

  return (
    <div className={styles.activeContainer}>
      <div className={styles.cardItemWrap}>
        <div className={styles.titleWrap}>
          <div className={styles.cardTitle}>Change Email</div>
          <div className={styles.cardDescription}>
            Current Email address: <span className={styles.colorNavy}>{userInfo.email}</span>
            <br />
            <span className={styles.hideMd}>Here you can update your email address.</span>
          </div>
        </div>
        <div className={styles.btnWrap}>
          <button onClick={handleChangeEmail} className='btn-biz grey'>
            Change Now
          </button>
        </div>
      </div>

      <div className={styles.cardItemWrap}>
        <div className={styles.titleWrap}>
          <div className={styles.cardTitle}>{userInfo.phone ? 'Change ' : 'Add'} Phone Number</div>
          <div className={styles.cardDescription}>
            Current phone number: <span className={styles.colorNavy}>{userInfo.phone || '--'}</span>
            <br />
            <span className={styles.hideMd}>Here you can update your phone number.</span>
          </div>
        </div>
        <div className={styles.btnWrap}>
          <button onClick={handleChangePhone} className='btn-biz grey'>
            {userInfo.phone ? 'Change ' : 'Add'} Now
          </button>
        </div>
      </div>

      <div className={styles.cardItemWrap}>
        <div className={styles.titleWrap}>
          <div className={styles.cardTitle}>Delete Account</div>
          <div className={styles.cardDescription}>
            We will be sad to see you go, but you always have the option to break our hearts....
          </div>
        </div>
        <div className={styles.btnWrap}>
          <button onClick={handleDelete} className='btn-biz red'>
            Delete {isMobileBiz ? 'Account' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
