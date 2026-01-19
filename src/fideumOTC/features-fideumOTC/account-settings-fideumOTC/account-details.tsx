import { Dispatch, SetStateAction, useEffect } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { $twoFaStatus } from 'model/two-fa'
import { $userInfo, getUserInfoFx } from 'model/user-info'

import { ACCOUNT_PAGES_FIDEUM_OTC } from './index'
import styles from './styles.module.scss'
import { TwoFaOnOffBiz } from 'biz/features-biz/modals-biz/two-fa-on-off-biz'
import { useCurrentBreakpoint } from 'hooks/use-current-breakpoint'

type Props = {
  setPage: Dispatch<SetStateAction<string>>
}

export function AccountDetails({ setPage }: Props) {
  const userInfo = useUnit($userInfo)
  const twoFaStatus = useUnit($twoFaStatus)
  const { isMobileBiz } = useCurrentBreakpoint()

  useEffect(() => {
    if (!userInfo.email) {
      getUserInfoFx()
    }
  }, [])

  const handleChangeEmail = () => {
    setPage(ACCOUNT_PAGES_FIDEUM_OTC.CHANGE_EMAIL)
  }

  const handleChangePassword = () => {
    setPage(ACCOUNT_PAGES_FIDEUM_OTC.CHANGE_PASSWORD)
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
    </div>
  )
}
