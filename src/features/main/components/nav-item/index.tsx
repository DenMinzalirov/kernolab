import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { pages } from 'constant'
import { SoonIcon } from 'icons'
import { HELP_LINKS, isBiz } from 'config'
import { $isMobileNavOpen, setIsMobileNavOpenEV } from 'model'
import { ArroNormalIconSmall } from 'assets/icons/arrow-normal-icon-small'

import { LogOutModal } from '../../../modals/log-out'
import { NavSubItemType } from '../nav-panel'
import styles from './styles.module.scss'
import { BREAKPOINT_PAIRS, useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

type Props = {
  path: string
  title: string
  Icon: React.FC<{ fill: string }>
  isSoon?: boolean
  subItems?: NavSubItemType[] | undefined
}

export function NavItem({ path, title, Icon, isSoon, subItems }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobileNavOpen = useUnit($isMobileNavOpen)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  const { currentBreakpointPairs } = useCurrentBreakpointPairs()

  const isTabletAndMobile = [BREAKPOINT_PAIRS.tablet, BREAKPOINT_PAIRS.mobile].includes(currentBreakpointPairs)

  const handleLogOut = () => {
    Modal.open(<LogOutModal />, {
      variant: 'center',
    })
  }

  const handleSupport = () => {
    window.open(HELP_LINKS.FAQ)
  }

  const handleClickItem = () => {
    if (isSoon) {
      console.log('isSoon')
    } else if (title === pages.SUPPORT.name && !isBiz) {
      handleSupport()
    } else if (title === pages.LOGOUT.name) {
      handleLogOut()
    } else {
      navigate(path)
    }
    setIsMobileNavOpenEV(!isMobileNavOpen)
  }

  const handleClickSubItem = (subItem: NavSubItemType) => {
    if (!subItem) return

    subItem.action && subItem.action(navigate)
    setIsMobileNavOpenEV(!isMobileNavOpen)
  }

  const mobileToggleMenu = (titleMenu: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [titleMenu]: !prev[titleMenu],
    }))
  }

  return (
    <>
      {!isTabletAndMobile ? (
        <div
          onClick={handleClickItem}
          className={clsx(styles.linkItem, location.pathname === path ? styles.active : '')}
        >
          <div className={styles.navIcon} style={isSoon ? { opacity: 0.2 } : {}}>
            <Icon fill={location.pathname === path ? 'var(--White)' : 'var(--Deep-Space)'} />
          </div>

          <p
            className={styles.title}
            style={{
              color: location.pathname === path ? 'var(--White)' : 'var(--Deep-Space)',
              opacity: isSoon ? 0.2 : 1,
            }}
          >
            {title}
          </p>
          {isSoon && <SoonIcon className={styles.soonImg} />}
        </div>
      ) : null}

      {isTabletAndMobile ? (
        <li className={styles.mobileMenuItem}>
          <div className={styles.mobileMenuItemWrapper}>
            <div className={styles.mobileMenuItemButton} onClick={handleClickItem}>
              <span className={styles.mobileMenuItemTitle}>{title}</span>
            </div>

            {subItems?.length ? (
              <div
                className={clsx(styles.mobileMenuItemToggle, openMenus[title] && styles.mobileMenuItemToggleOpen)}
                onClick={() => mobileToggleMenu(title)}
              >
                <ArroNormalIconSmall />
              </div>
            ) : (
              <div className={styles.width30} />
            )}
          </div>

          {openMenus[title] &&
            subItems?.length &&
            subItems.map(subItem => (
              <div
                key={subItem.title}
                className={styles.mobileMenuItemSubTitle}
                onClick={() => handleClickSubItem(subItem)}
              >
                {subItem.title}
              </div>
            ))}
        </li>
      ) : null}
    </>
  )
}
