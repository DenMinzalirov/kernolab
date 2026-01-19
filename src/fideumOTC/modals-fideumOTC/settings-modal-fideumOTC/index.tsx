import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { pages } from 'constant'
import { LogOutModal } from 'features/modals/log-out'
import { transformEmail } from 'utils/transform-email'
import { $userInfo, getUserInfoFx } from 'model/user-info'
import nextModal from 'assets/icons/next-modal-dark.svg'

import styles from './styles.module.scss'

export function SettingsModalFideumOTC() {
  const userInfo = useUnit($userInfo)

  const navigate = useNavigate()

  useEffect(() => {
    if (!userInfo.email) {
      getUserInfoFx().then(r => null)
    }
  }, [])

  const handleGoAccountSettings = () => {
    navigate(pages.ACCOUNT_SETTINGS.path)
    Modal.close()
  }

  const handleLogOut = async () => {
    Modal.open(<LogOutModal />, {
      variant: 'center',
    })
  }

  return (
    <div className={styles.containerModal}>
      <div className={styles.header}>
        <div className={clsx(styles.avatar, styles.hideMd)}>{transformEmail(userInfo.email).toUpperCase()}</div>
        <div className={styles.email}>{userInfo.email}</div>
      </div>

      <div className={styles.btnGroup}>
        <div className={styles.mainBtn}>
          <div onClick={handleGoAccountSettings} className={clsx(styles.currencyWrap, styles.currencyWrapHover)}>
            <div className={styles.btnText}>Account Settings</div>
            <img className={styles.cursorPointer} src={nextModal} alt='' />
          </div>
        </div>

        <div
          onClick={handleLogOut}
          className={clsx(styles.currencyWrap, styles.cursorPointer, styles.currencyWrapHover)}
        >
          <div className={styles.logoutbtnText}>Log Out</div>
        </div>
      </div>
    </div>
  )
}
