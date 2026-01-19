import React, { Dispatch, SetStateAction } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from '../../../components'
import { LogOutModal } from '../../../features/modals/log-out'
import { $twoFaStatus } from '../../../model/two-fa'
import { TwoFaOnOffBiz } from '../modals-biz/two-fa-on-off-biz'
import { ACCOUNT_PAGES } from './index'
import styles from './styles.module.scss'

type Props = {
  setPage: Dispatch<SetStateAction<string>>
}

export function Security({ setPage }: Props) {
  const twoFaStatus = useUnit($twoFaStatus)

  const handleChangePassword = () => {
    setPage(ACCOUNT_PAGES.CHANGE_PASSWORD)
  }

  const handleLogOut = () => {
    Modal.open(<LogOutModal isGlobal={true} />, {
      variant: 'center',
    })
  }

  const handleChange2fa = (data: boolean) => {
    Modal.open(<TwoFaOnOffBiz setPage={setPage} />, { variant: 'center' })
  }

  return (
    <div className={styles.activeContainer}>
      <div className={styles.cardItemWrap}>
        <div className={styles.titleWrap}>
          <div className={styles.cardTitle}>Two Factor Authentication</div>
          <div className={styles.cardDescription}>
            Protect your account by setting up <span className={styles.hideMd}>Two Factor Authentication</span>
            <span className={styles.showMd}>2FA</span> for your account.
          </div>
        </div>
        <div className={styles.switcherWrap}>
          <div
            onClick={() => handleChange2fa(true)}
            className={clsx(styles.switcherItem, { [styles.switcherItemActive]: twoFaStatus })}
          >
            Turn On
          </div>
          <div
            onClick={() => handleChange2fa(false)}
            className={clsx(styles.switcherItem, { [styles.switcherItemActive]: !twoFaStatus })}
          >
            Turn Off
          </div>
        </div>
      </div>

      <div className={styles.cardItemWrap}>
        <div className={styles.titleWrap}>
          <div className={styles.cardTitle}>Change Password</div>
          <div className={styles.cardDescription}>
            You can update your account password anytime. To change password follow our instructions.
          </div>
        </div>
        <div className={styles.btnWrap}>
          <button onClick={handleChangePassword} className='btn-biz grey'>
            Change Now
          </button>
        </div>
      </div>

      <div className={styles.cardItemWrap}>
        <div className={styles.titleWrap}>
          <div className={styles.cardTitle}>Log Out from Everywhere</div>
          <div className={styles.cardDescription}>
            This logs you out of Fideum everywhere you&rsquo;re logged in including the mobile and desktop.
          </div>
        </div>
        <div className={styles.btnWrap}>
          <button onClick={handleLogOut} className='btn-biz red'>
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}
