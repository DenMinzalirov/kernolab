import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import nextModal from '../../../../assets/icons/next-modal.svg'
import { Modal } from '../../../../components'
import { theme, themeValue } from '../../../../config'
import { pages } from '../../../../constant'
import { LogOutModal } from '../../../../features/modals/log-out'
import { resetStoresEv } from '../../../../model/auth-logout'
import { $currency, currencyChangedEv, CurrencyType, defaultCurrency } from '../../../../model/currency'
import { $userInfo, getUserInfoFx } from '../../../../model/user-info'
import { clearRefreshToken, clearToken } from '../../../../utils'
import { transformEmail } from '../../../../utils/transform-email'
import { AuthServiceV4 } from '../../../../wip/services'
import { initApp } from '../../../../wip/stores'
import styles from './styles.module.scss'

export function SettingsModalBiz() {
  const userInfo = useUnit($userInfo)
  const currency = useUnit($currency)

  const navigate = useNavigate()

  useEffect(() => {
    if (!userInfo.email) {
      getUserInfoFx().then(r => null)
    }
  }, [])

  const handleChangeCurrency = async (data: CurrencyType) => {
    currencyChangedEv(defaultCurrency[data])
    await initApp()
  }

  const handleGoWhitelist = () => {
    navigate(pages.WHITELIST.path)
    Modal.close()
  }

  const handleGoAccountSettings = () => {
    navigate(pages.ACCOUNT_SETTINGS.path)
    Modal.close()
  }

  const handleGoHelp = () => {
    navigate(pages.SUPPORT.path)
    Modal.close()
  }

  const handleLogOut = async () => {
    Modal.open(<LogOutModal />, {
      variant: 'center',
    })
    // try {
    //   await AuthServiceV4.logOut()
    // } catch (error: any) {
    //   console.log('ERROR-handleLogOut', error)
    // } finally {
    //   resetStoresEv()
    //   clearToken()
    //   clearRefreshToken()
    //
    //   navigate(pages.SignIn.path)
    //   Modal.close()
    // }
  }

  return (
    <div className={styles.containerModal}>
      <div className={styles.header}>
        <div className={clsx(styles.avatar, styles.hideMd)}>{transformEmail(userInfo.email).toUpperCase()}</div>
        <div className={styles.email}>{userInfo.email}</div>
      </div>

      <div className={styles.btnGroup}>
        <div className={styles.mainBtn}>
          <div className={styles.currencySwitchWrap}>
            <div className={styles.btnText}>Currency</div>
            <div className={styles.switcher}>
              <div
                onClick={() => handleChangeCurrency('EUR')}
                className={clsx(styles.switcherItem, { [styles.switcherItemActive]: currency.type === 'EUR' })}
              >
                EUR
              </div>
              <div
                onClick={() => handleChangeCurrency('USD')}
                className={clsx(styles.switcherItem, { [styles.switcherItemActive]: currency.type === 'USD' })}
              >
                USD
              </div>
            </div>
          </div>

          {theme === themeValue.zekret ? null : (
            <div onClick={handleGoWhitelist} className={clsx(styles.currencyWrap, styles.currencyWrapHover)}>
              <div className={styles.btnText}>Whitelist</div>
              <img className={styles.cursorPointer} src={nextModal} alt='' />
            </div>
          )}

          <div onClick={handleGoAccountSettings} className={clsx(styles.currencyWrap, styles.currencyWrapHover)}>
            <div className={styles.btnText}>Account Settings</div>
            <img className={styles.cursorPointer} src={nextModal} alt='' />
          </div>
        </div>

        <div onClick={handleGoHelp} className={clsx(styles.currencyWrap, styles.currencyWrapHover)}>
          <div className={styles.btnText}>Help</div>
          <img className={styles.cursorPointer} src={nextModal} alt='' />
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
