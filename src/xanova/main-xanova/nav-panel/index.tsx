import { type ComponentType, useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { pages } from 'constant'
import { calculateTimeRemaining } from 'utils/calculate-time-remaining'
import { goSupportXanova } from 'config'
import { $stepUpBlockExpiration } from 'model/step-up-block-expiration'

import { useNavPanelActiveIds } from './hooks/use-nav-panel-active-ids'
import { useNavPanelOverlay } from './hooks/use-nav-panel-overlay'
import { useOutsideDismiss } from './hooks/use-outside-dismiss'
import { ArrowIcon } from './nav-icons/arrow-icon'
import { ChevronRightIcon } from './nav-icons/chevron-right-icon'
import { CloseIcon } from './nav-icons/close-icon'
import { LogoutIcon } from './nav-icons/logout-icon'
import { MenuIcon } from './nav-icons/menu-icon'
import { ProfileIcon } from './nav-icons/profile-icon'
import { SettingsIcon } from './nav-icons/settings-icon'
import { SupportIcon } from './nav-icons/support-icon'
import styles from './styles.module.scss'
import type { NavItem, SubItem, SubItemIcon } from './types'
import { useCurrentBreakpointXanova } from 'hooks/use-current-breakpoint-xanova'
import { CountdownTimerXanova } from 'xanova/components/countdown-timer'
import { LogOutModalXanova } from 'xanova/modal/log-out'
import { SecurityTimerModalXanova } from 'xanova/modal/security-timer-modal-xanova'

const MAIN_NAV_ITEMS: NavItem[] = [
  {
    id: 'membership',
    label: 'Membership',
    path: '/',
    submenu: [
      { id: 'insurance', label: pages.INSURANCE.name, path: pages.INSURANCE.path },
      { id: 'trading-investments', label: pages.TRADING_INVESTMENTS.name, path: pages.TRADING_INVESTMENTS.path },
      { id: 'start-rep', label: 'Start Rep', path: '/start-rep' },
    ],
  },
  {
    id: 'earnings',
    label: 'Earnings',
    path: '/earnings',
    submenu: [
      { id: 'commissions', label: pages.COMMISSIONS.name, path: pages.COMMISSIONS.path },
      { id: 'payouts', label: pages.PAYOUTS.name, path: pages.PAYOUTS.path },
    ],
  },
  {
    id: 'extras',
    label: 'Extras',
    path: '/extras',
    submenu: [
      { id: 'pension', label: pages.PENSION.name, path: pages.PENSION.path },
      { id: 'ai-tool', label: pages.AI_TOOL.name, path: pages.AI_TOOL.path },
      { id: 'wallet', label: pages.WALLET.name, path: pages.WALLET.path },
    ],
  },
]

const CONTROL_ITEMS: NavItem[] = [
  {
    id: 'settings',
    path: pages.ACCOUNT_SETTINGS.path,
    label: 'Settings',
    icon: 'settings',
    isButton: true,
    submenu: [],
  },
  {
    id: 'profile',
    path: '/profile',
    label: '',
    icon: 'profile',
    dropdownTone: 'light',
    align: 'right',
    submenu: [
      { id: 'profile-support', label: 'Support', path: 'support', icon: 'support' },
      { id: 'profile-logout', label: 'Log Out', path: 'logout', icon: 'logout' },
    ],
  },
]

const CONTROL_SUBITEM_ICONS: Record<SubItemIcon, ComponentType<{ className?: string }>> = {
  support: SupportIcon,
  logout: LogoutIcon,
}

export function NavPanelXanova() {
  const navigate = useNavigate()
  const location = useLocation()

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeControlDropdownId, setActiveControlDropdownId] = useState<string | null>(null)
  const { isDesktopXanova } = useCurrentBreakpointXanova()
  const isSmallViewport = !isDesktopXanova
  const {
    isOverlayVisible,
    navRootRef,
    logoRef,
    closeOverlayImmediately,
    handleDropdownEnter,
    handleDropdownLeave,
    handleNavRootLeave,
  } = useNavPanelOverlay()

  const securityTimerData = useUnit($stepUpBlockExpiration)
  const timeRemaining = calculateTimeRemaining(securityTimerData?.expiresAt || '')

  const handleTimerClick = () => {
    Modal.open(<SecurityTimerModalXanova />, { variant: 'center' })
  }

  const activeIds = useNavPanelActiveIds(MAIN_NAV_ITEMS, location.pathname)

  const handleNavigate = (path: string) => {
    console.log('handleNavigate', path)
    closeOverlayImmediately()
    navigate(path)
  }

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
    setActiveControlDropdownId(null)
    closeOverlayImmediately()
  }, [closeOverlayImmediately])

  const closeActiveControlDropdown = useCallback(() => {
    setActiveControlDropdownId(null)
  }, [])

  const handleMobileMenuToggle = () => {
    setActiveControlDropdownId(null)
    if (isMobileMenuOpen) {
      closeMobileMenu()
      return
    }

    closeOverlayImmediately()
    setMobileMenuOpen(true)
  }

  const handleSupportClick = useCallback(() => {
    closeOverlayImmediately()
    goSupportXanova()
  }, [closeOverlayImmediately])

  const handleLogoutClick = useCallback(() => {
    closeOverlayImmediately()
    Modal.open(<LogOutModalXanova />, { variant: 'center' })
  }, [closeOverlayImmediately])

  const handleNavButtonClick = (item: NavItem) => {
    if (item.isButton) {
      handleNavigate(item.path)
      return
    }

    if (item.submenu && isSmallViewport) {
      setMobileMenuOpen(false)
      setActiveControlDropdownId(prev => (prev === item.id ? null : item.id))
      return
    }

    setActiveControlDropdownId(null)
  }

  const handleSubItemClick = (subItem: SubItem) => {
    setActiveControlDropdownId(null)
    if (subItem.id === 'profile-support') {
      handleSupportClick()
      return
    }

    if (subItem.id === 'profile-logout') {
      handleLogoutClick()
      return
    }

    handleNavigate(subItem.path)
  }

  const handleMobileSubItemClick = (subItem: SubItem) => {
    closeMobileMenu()
    handleSubItemClick(subItem)
  }

  useOutsideDismiss({
    isActive: isMobileMenuOpen,
    rootRef: navRootRef,
    onDismiss: closeMobileMenu,
  })

  useOutsideDismiss({
    isActive: Boolean(activeControlDropdownId) && isSmallViewport,
    rootRef: navRootRef,
    onDismiss: closeActiveControlDropdown,
  })

  useEffect(() => {
    closeMobileMenu()
    closeActiveControlDropdown()
  }, [closeActiveControlDropdown, closeMobileMenu, location.pathname])

  useEffect(() => {
    if (!isSmallViewport) {
      setActiveControlDropdownId(null)
    }
  }, [isSmallViewport])

  const isOverlayActive = isOverlayVisible || isMobileMenuOpen || activeControlDropdownId !== null

  const mobileMenuId = 'nav-panel-mobile-menu'

  return (
    <header className={styles.navPanel}>
      <div className={clsx(styles.navOverlay, isOverlayActive && styles.navOverlayVisible)} />
      <div ref={navRootRef} className={styles.navPanelInner} onMouseLeave={handleNavRootLeave}>
        <button
          ref={logoRef}
          type='button'
          className={styles.logoPlaceholder}
          onClick={() => handleNavigate('/')}
          aria-label='Go to homepage'
        >
          XANOVA
        </button>

        <nav className={styles.menuWrapper}>
          {securityTimerData?.expiresAt ? (
            <div className={styles.timerXanovaWrap} onClick={handleTimerClick}>
              <CountdownTimerXanova initialTime={timeRemaining} colorScheme='Warning' />
            </div>
          ) : null}
          <ul className={styles.menuList}>
            {MAIN_NAV_ITEMS.map(item => {
              const isActive = activeIds.has(item.id)
              return (
                <li
                  key={item.id}
                  data-nav-interactive-root
                  className={styles.menuItem}
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                  onFocusCapture={handleDropdownEnter}
                  onBlurCapture={handleDropdownLeave}
                >
                  <button
                    type='button'
                    className={clsx(styles.menuButton, isActive && styles.menuButtonActive)}
                    onClick={() => handleNavButtonClick(item)}
                  >
                    <span>{item.label}</span>
                    <ArrowIcon className={styles.menuButtonIcon} />
                  </button>
                  {item.submenu && (
                    <div
                      className={clsx(
                        styles.dropdownMenu,
                        item.dropdownTone === 'light' && styles.dropdownLight,
                        item.align === 'right' && styles.dropdownAlignRight
                      )}
                      onMouseEnter={handleDropdownEnter}
                      onMouseLeave={handleDropdownLeave}
                      onFocusCapture={handleDropdownEnter}
                      onBlurCapture={handleDropdownLeave}
                    >
                      {item.submenu.map(subItem => {
                        const isSubActive = activeIds.has(subItem.id)
                        return (
                          <button
                            key={subItem.id}
                            className={clsx(styles.dropdownItem, isSubActive && styles.dropdownItemActive)}
                            onClick={() => handleSubItemClick(subItem)}
                          >
                            {subItem.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
          <div className={styles.controlList}>
            {CONTROL_ITEMS.map(item => {
              const isActive = activeIds.has(item.id)
              const dropdownClasses = clsx(
                styles.controlDropdown,
                item.dropdownTone === 'light' && styles.dropdownLight,
                item.align === 'right' && styles.dropdownAlignRight,
                isSmallViewport && activeControlDropdownId === item.id && styles.controlDropdownOpen
              )
              const controlDropdownId = `nav-panel-control-dropdown-${item.id}`

              return (
                <div
                  key={item.id}
                  data-nav-interactive-root
                  className={styles.controlItem}
                  onMouseEnter={isSmallViewport ? undefined : handleDropdownEnter}
                  onMouseLeave={isSmallViewport ? undefined : handleDropdownLeave}
                  onFocusCapture={isSmallViewport ? undefined : handleDropdownEnter}
                  onBlurCapture={isSmallViewport ? undefined : handleDropdownLeave}
                >
                  <button
                    type='button'
                    className={clsx(
                      styles.controlButton,
                      (isActive || (isSmallViewport && activeControlDropdownId === item.id)) &&
                        styles.controlButtonActive,
                      item.icon === 'profile' && styles.controlButtonIconOnly
                    )}
                    onClick={() => handleNavButtonClick(item)}
                    aria-expanded={item.submenu && isSmallViewport ? activeControlDropdownId === item.id : undefined}
                    aria-controls={item.submenu ? controlDropdownId : undefined}
                    aria-haspopup={item.submenu ? 'menu' : undefined}
                  >
                    {item.icon === 'settings' && <SettingsIcon className={styles.controlButtonIcon} />}
                    {item.icon === 'profile' && <ProfileIcon className={styles.controlButtonIcon} />}
                    {item.label && <span className={styles.controlButtonLabel}>{item.label}</span>}
                  </button>
                  {item.submenu && item.submenu.length > 0 && (
                    <div
                      className={dropdownClasses}
                      id={controlDropdownId}
                      onMouseEnter={isSmallViewport ? undefined : handleDropdownEnter}
                      onMouseLeave={isSmallViewport ? undefined : handleDropdownLeave}
                      onFocusCapture={isSmallViewport ? undefined : handleDropdownEnter}
                      onBlurCapture={isSmallViewport ? undefined : handleDropdownLeave}
                    >
                      {item.submenu.map(subItem => {
                        const isSubActive = activeIds.has(subItem.id)
                        const IconComponent = subItem.icon ? CONTROL_SUBITEM_ICONS[subItem.icon] : null
                        const isLogout = subItem.icon === 'logout'

                        return (
                          <button
                            key={subItem.id}
                            type='button'
                            className={clsx(
                              styles.dropdownItem,
                              styles.controlDropdownItem,
                              isSubActive && styles.dropdownItemActive
                            )}
                            onClick={() => handleSubItemClick(subItem)}
                          >
                            {IconComponent && (
                              <IconComponent
                                className={clsx(
                                  styles.controlDropdownItemIcon,
                                  isLogout && styles.controlDropdownItemIconLogout
                                )}
                              />
                            )}
                            <span className={isLogout ? styles.controlDropdownItemLogout : ''}>{subItem.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            <div data-nav-interactive-root className={clsx(styles.controlItem, styles.mobileMenuControl)}>
              <button
                type='button'
                aria-expanded={isMobileMenuOpen}
                aria-controls={mobileMenuId}
                className={clsx(
                  styles.controlButton,
                  styles.controlButtonIconOnly,
                  isMobileMenuOpen && styles.controlButtonActive
                )}
                onClick={handleMobileMenuToggle}
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {isMobileMenuOpen ? (
                  <CloseIcon className={styles.controlButtonIcon} />
                ) : (
                  <MenuIcon className={styles.controlButtonIcon} />
                )}
              </button>
              <div
                id={mobileMenuId}
                className={clsx(styles.mobileMenuDropdown, isMobileMenuOpen && styles.mobileMenuDropdownOpen)}
              >
                {MAIN_NAV_ITEMS.map(item => (
                  <div key={item.id} className={styles.mobileMenuGroup}>
                    <div className={styles.mobileMenuGroupTitle}>{item.label}</div>
                    <div className={styles.mobileMenuSubItems}>
                      {item.submenu?.map(subItem => {
                        const isSubActive = activeIds.has(subItem.id)

                        return (
                          <button
                            key={subItem.id}
                            type='button'
                            className={clsx(styles.mobileMenuSubItem, isSubActive && styles.mobileMenuSubItemActive)}
                            onClick={() => handleMobileSubItemClick(subItem)}
                          >
                            <span>{subItem.label}</span>
                            {isSubActive ? null : <ChevronRightIcon className={styles.mobileMenuSubItemIcon} />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
