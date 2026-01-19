import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { CountdownTimer } from 'components/countdown-timer'
import { calculateTimeRemaining } from 'utils/calculate-time-remaining'
import { $stepUpBlockExpiration } from 'model/step-up-block-expiration'

import { Modal } from '../../components'
import { theme, themeLogo, themeValue } from '../../config'
import { pages } from '../../constant'
import { $userInfo, getUserInfoFx } from '../../model/user-info'
import { transformEmail } from '../../utils/transform-email'
import { SettingsModalBiz } from '../features-biz/modals-biz/settings-modal-biz'
import comingSoon from './comingSoon.svg'
import styles from './styles.module.scss'
import { SecurityTimerModalBiz } from 'biz/features-biz/modals-biz/security-timer-modal-biz'
import { BREAKPOINT, useCurrentBreakpoint } from 'hooks/use-current-breakpoint'

const getNavItems = () => {
  const baseNavItems = {
    dashboard: [
      { title: 'My Crypto Wallets', path: pages.CRYPTO_WALLETS.path },
      // { title: 'My Fiat Wallets', path: pages.FIAT_WALLETS.path }, //TODO hide it as long as we have only one fiat.
      { title: 'My Transactions', path: pages.TRANSACTIONS_HISTORY.path },
    ],
    receive: [
      { title: 'Crypto', path: pages.RECEIVE_CRYPTO.path },
      { title: 'Fiat', path: pages.RECEIVE_FIAT.path },
    ],
    send: [
      { title: 'Crypto', path: pages.SEND_CRYPTO.path },
      { title: 'Fiat', path: pages.SEND_FIAT.path },
    ],
    trade: [{ title: 'Exchange', path: pages.TRADE_CRYPTO.path }] as Array<{ title: string; path: string }>,
  }

  // Добавляем OTC только для бизнес-темы
  if (theme === themeValue.biz) {
    baseNavItems.trade.unshift({ title: 'OTC', path: pages.OTC.path })
  }

  return baseNavItems
}

const navItems = getNavItems()

type NavKey = keyof typeof navItems

export function NavPanelBiz() {
  const navigate = useNavigate()
  const location = useLocation()

  const userInfo = useUnit($userInfo)
  const securityTimerData = useUnit($stepUpBlockExpiration)
  const timeRemaining = calculateTimeRemaining(securityTimerData?.expiresAt || '')
  const { isMobileBiz, currentBreakpointBiz } = useCurrentBreakpoint()

  // Проверяем, является ли тема zekret
  const isZekretTheme = theme === themeValue.zekret

  const handleOpenSettings = () => {
    Modal.open(<SettingsModalBiz />, { variant: 'right-top' })
  }

  useEffect(() => {
    if (!userInfo.email) {
      getUserInfoFx()
    }
  }, [])

  const dashboardRef = useRef<HTMLDivElement | null>(null)
  const receiveRef = useRef<HTMLDivElement | null>(null)
  const sendRef = useRef<HTMLDivElement | null>(null)
  const tradeRef = useRef<HTMLDivElement | null>(null)

  const isDashboardLocation = (
    [pages.Base.path, pages.CRYPTO_WALLETS.path, pages.FIAT_WALLETS.path, pages.TRANSACTIONS_HISTORY.path] as string[]
  ).includes(location.pathname)
  const isReceiveLocation = ([pages.RECEIVE_CRYPTO.path, pages.RECEIVE_FIAT.path] as string[]).includes(
    location.pathname
  )
  const isSendLocation = ([pages.SEND_CRYPTO.path, pages.SEND_FIAT.path] as string[]).includes(location.pathname)
  const isTradeLocation = false

  const [isShowMenu, setIsShowMenu] = useState(false)
  const [navPosition, setNavPosition] = useState(0)
  const [focusPath, setFocusPath] = useState<NavKey>('dashboard')

  useEffect(() => {
    // isDashboardLocation && setFocusPath('dashboard')
    isReceiveLocation && setFocusPath('receive')
    isSendLocation && setFocusPath('send')
  }, [])

  useEffect(() => {
    if (focusPath === 'dashboard' && dashboardRef.current) {
      const x = dashboardRef.current.getBoundingClientRect().x
      // Maximum X value for a screen width of 1900px, returned by getBoundingClientRect
      const MAX_X_FOR_1900PX = securityTimerData?.expiresAt ? 737 : 793
      setNavPosition(x > MAX_X_FOR_1900PX ? MAX_X_FOR_1900PX : x)
    }

    if (focusPath === 'receive' && receiveRef.current) {
      const x = receiveRef.current.getBoundingClientRect().x
      // Maximum X value for a screen width of 1900px, returned by getBoundingClientRect
      const MAX_X_FOR_1900PX = securityTimerData?.expiresAt ? 843 : 900
      setNavPosition(x > MAX_X_FOR_1900PX ? MAX_X_FOR_1900PX : x)
    }

    if (focusPath === 'send' && sendRef.current) {
      const x = sendRef.current.getBoundingClientRect().x
      // Maximum X value for a screen width of 1900px, returned by getBoundingClientRect
      const MAX_X_FOR_1900PX = securityTimerData?.expiresAt ? 932 : 989
      setNavPosition(x > MAX_X_FOR_1900PX ? MAX_X_FOR_1900PX : x)
    }

    if (focusPath === 'trade' && tradeRef.current) {
      const x = tradeRef.current.getBoundingClientRect().x
      // Maximum X value for a screen width of 1900px, returned by getBoundingClientRect
      const MAX_X_FOR_1900PX = securityTimerData?.expiresAt ? 1006 : 1062
      setNavPosition(x > MAX_X_FOR_1900PX ? MAX_X_FOR_1900PX : x)
    }
  }, [focusPath])

  const navigateTo = (path: string) => {
    navigate(path)
  }

  const handleTimerClick = () => {
    Modal.open(<SecurityTimerModalBiz />, { variant: 'center' })
  }

  const toggleMenu = () => {
    setIsShowMenu(prev => !prev)
  }

  const handleClickLogo = () => {
    navigateTo(pages.Base.path)
    setIsShowMenu(false)
  }

  const handleMouseEnter = (path: NavKey) => {
    if (!isMobileBiz) {
      setIsShowMenu(true)
      setFocusPath(path)
    }
  }

  const showAccountText =
    [BREAKPOINT.xl, BREAKPOINT.xxl].includes(currentBreakpointBiz) && !securityTimerData?.expiresAt

  // Функция для определения, должен ли пункт меню быть неактивным
  const isNavItemDisabled = (navKey: NavKey) => {
    return isZekretTheme && ['dashboard', 'receive', 'send', 'trade'].includes(navKey)
  }

  // Функция для получения стилей неактивного пункта меню
  const getDisabledNavStyles = (navKey: NavKey) => {
    if (!isNavItemDisabled(navKey)) return {}

    return {
      cursor: 'not-allowed',
      opacity: 0.6,
      pointerEvents: 'none' as const,
    }
  }

  // Функция для рендера иконки comingSoon
  const renderComingSoonIcon = () => {
    if (!isZekretTheme) return null
    return <img src={comingSoon} alt={'coming soon'} style={{ marginLeft: 5 }} />
  }

  return (
    <>
      <div className={styles.mainNavPanelContainer}>
        <section className={styles.mainNavPanel}>
          <img
            src={themeLogo()}
            alt='Logo'
            className={styles.bbLogo}
            style={theme === themeValue.zekret ? { height: 30 } : {}}
            onClick={handleClickLogo}
          />
          {/* hide on mobile */}
          <div className={styles.navPanelWrap}>
            <div
              onClick={() => navigateTo(pages.Base.path)}
              onMouseEnter={() => handleMouseEnter('dashboard')}
              ref={dashboardRef}
              className={isDashboardLocation ? styles.navActiveLocation : styles.navHover}
              style={getDisabledNavStyles('receive')}
            >
              Dashboard
            </div>
            <div
              onMouseEnter={() => !isNavItemDisabled('receive') && handleMouseEnter('receive')}
              ref={receiveRef}
              className={isReceiveLocation ? styles.navActiveLocation : styles.navHover}
              style={getDisabledNavStyles('receive')}
            >
              Receive
              {renderComingSoonIcon()}
            </div>
            <div
              onMouseEnter={() => !isNavItemDisabled('send') && handleMouseEnter('send')}
              ref={sendRef}
              className={isSendLocation ? styles.navActiveLocation : styles.navHover}
              style={getDisabledNavStyles('send')}
            >
              Send
              {renderComingSoonIcon()}
            </div>
            <div
              onMouseEnter={() => !isNavItemDisabled('trade') && handleMouseEnter('trade')}
              ref={tradeRef}
              className={isTradeLocation ? styles.navActiveLocation : styles.navHover}
              style={getDisabledNavStyles('trade')}
            >
              Trade
              {renderComingSoonIcon()}
            </div>
          </div>

          <div className={styles.navProfileWrap}>
            {securityTimerData?.expiresAt ? (
              <div className={styles.navTimerWrap} onClick={handleTimerClick}>
                <CountdownTimer
                  initialTime={timeRemaining}
                  colorScheme='Warning'
                  showTitle={currentBreakpointBiz !== BREAKPOINT.xl}
                />
              </div>
            ) : null}

            <div onClick={handleOpenSettings} className={styles.settingsWrap}>
              <div className={styles.settingsBtnIcon}>{transformEmail(userInfo.email).toUpperCase()}</div>
              {showAccountText ? <div className={styles.settingsText}>My Account</div> : null}
            </div>

            {isMobileBiz ? (
              <div onClick={toggleMenu} className={styles.navBurgerBtn}>
                <div className={styles.navBurgerLine} />
                <div className={styles.navBurgerLine} />
              </div>
            ) : null}
          </div>
        </section>

        {isShowMenu && !isMobileBiz ? (
          <div onMouseLeave={() => setIsShowMenu(false)} className={styles.navMenu}>
            <div className={styles.navPanelLocalBlockWrap} style={{ paddingLeft: navPosition }}>
              {navItems[focusPath].map(item => {
                return (
                  <div
                    key={item.title}
                    className={item.path === location.pathname ? styles.navActiveLocation : styles.navHover}
                    onClick={() => !isNavItemDisabled(focusPath) && navigateTo(item.path)}
                    style={getDisabledNavStyles(focusPath)}
                  >
                    {item.title}
                  </div>
                )
              })}

              {/*{focusPath === 'receive'*/}
              {/*  ? navItems.receive.map(item => {*/}
              {/*      return <div key={item.title}>{item.title}</div>*/}
              {/*    })*/}
              {/*  : null}*/}
            </div>

            <div
              onClick={() => setIsShowMenu(false)}
              onMouseEnter={() => setIsShowMenu(false)}
              className={styles.navBlur}
            />
          </div>
        ) : null}
      </div>

      {isShowMenu && isMobileBiz ? (
        <div className={styles.navMenu}>
          <div onClick={toggleMenu} className={styles.navBlur} />

          <section className={styles.navSectionMd}>
            <div onClick={toggleMenu} className={styles.navBurgerBtn}>
              <div className={styles.navBurgerLine} />
              <div className={styles.navBurgerLine} />
            </div>

            <div className={styles.navContentMd}>
              {Object.entries(navItems).map(([key, items]) => {
                return (
                  <div key={key} className={styles.navItemsWrapMd}>
                    <div className={styles.navTitleMd}>
                      {key} {key !== 'dashboard' && renderComingSoonIcon()}
                    </div>

                    <div className={styles.navItemsMd}>
                      {items.map(item => (
                        <div
                          key={item.title}
                          className={clsx(
                            styles.navItemTextMd,
                            item.path === location.pathname && styles.navItemActiveMd
                          )}
                          onClick={() => !isNavItemDisabled(key as NavKey) && navigateTo(item.path)}
                          style={getDisabledNavStyles(key as NavKey)}
                        >
                          {item.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
