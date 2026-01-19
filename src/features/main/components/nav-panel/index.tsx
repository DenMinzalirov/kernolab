import React, { useEffect, useMemo } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { StepUpUnlockTimer } from 'components/step-up-unlock-timer'
import { pages } from 'constant'
import { TYPE_TXN_HISTORY } from 'features/transactions-history/constants'
import { getToken } from 'utils'
import {
  BankingIcon,
  EarnIcon,
  LaunchpadIcon,
  LogoOutIcon,
  PortfolioIcon,
  SettingsIcon,
  SupportIcon,
  TransactionsIcon,
} from 'icons'
import { CardIcon } from 'icons/card'
import { HELP_LINKS, theme, themeLogo, themeValue } from 'config'
import { $isMobileNavOpen, setIsMobileNavOpenEV } from 'model'
import { $userInfo, getUserInfoFx } from 'model/user-info'

import { NavItem } from '../nav-item'
import styles from './styles.module.scss'
import { BREAKPOINT_PAIRS, useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

const navItemsStartObject: Record<string, NavItemType> = {
  [pages.PORTFOLIO.name]: {
    path: pages.PORTFOLIO.path,
    title: pages.PORTFOLIO.name,
    Icon: PortfolioIcon,
    subItems: [
      {
        title: 'Crypto Transactions',
        action: (navigate?: NavigateFunction) => {
          navigate && navigate(pages.TRANSACTIONS_HISTORY.path, { state: { type: TYPE_TXN_HISTORY.CRYPTO } })
        },
      },
    ],
  },
  [pages.EARN.name]: {
    path: pages.EARN.path,
    title: pages.EARN.name,
    Icon: EarnIcon,
    isSoon: theme === themeValue.biz,
    subItems: [
      {
        title: 'Earning Transactions',
        action: (navigate?: NavigateFunction) => {
          navigate && navigate(pages.TRANSACTIONS_HISTORY.path, { state: { type: TYPE_TXN_HISTORY.STAKING } })
        },
      },
    ],
  },
  [pages.BANKING.name]: {
    path: pages.BANKING.path,
    title: pages.BANKING.name,
    Icon: BankingIcon,
    subItems: [
      {
        title: 'Fiat Transactions',
        action: (navigate?: NavigateFunction) => {
          navigate && navigate(pages.TRANSACTIONS_HISTORY.path, { state: { type: TYPE_TXN_HISTORY.FIAT } })
        },
      },
    ],
  },
  [pages.CARD.name]: {
    path: pages.CARD.path,
    title: pages.CARD.name,
    Icon: CardIcon,
    subItems: [
      {
        title: 'Card Transactions',
        action: (navigate?: NavigateFunction) => {
          navigate && navigate(pages.TRANSACTIONS_HISTORY.path, { state: { type: TYPE_TXN_HISTORY.CARD } })
        },
      },
    ],
  },
  [pages.OTC.name]: {
    path: pages.OTC.path,
    title: pages.OTC.name,
    Icon: BankingIcon,
    isSoon: true,
  },
  [pages.STAKING.name]: {
    path: pages.EARN.path,
    title: pages.STAKING.name,
    Icon: BankingIcon,
  },
  [pages.LAUNCHPAD.name]: {
    path: pages.LAUNCHPAD.path,
    title: pages.LAUNCHPAD.name,
    Icon: LaunchpadIcon,
    subItems: [
      {
        title: 'Launch a Project',
        action: () => {
          window.open(HELP_LINKS.LAUNCH_A_PROJECT)
        },
      },
    ],
  },
  [pages.SUPPORT.name]: {
    path: pages.SUPPORT.path,
    title: pages.SUPPORT.name,
    Icon: SupportIcon,
  },
  [pages.TRANSACTIONS_HISTORY.name]: {
    path: pages.TRANSACTIONS_HISTORY.path,
    title: pages.TRANSACTIONS_HISTORY.name,
    Icon: TransactionsIcon,
  },
}

const PairsNavState = [
  pages.PORTFOLIO.name,
  pages.EARN.name,
  pages.BANKING.name,
  pages.CARD.name,
  pages.LAUNCHPAD.name,
  pages.SUPPORT.name,
]
const BizNavState = [pages.PORTFOLIO.name, pages.EARN.name, pages.BANKING.name, pages.OTC.name, pages.SUPPORT.name]
const KaizenNavState = [pages.PORTFOLIO.name, pages.BANKING.name, pages.SUPPORT.name]

const navItemsEnd = [
  {
    path: pages.SETTINGS.path,
    title: pages.SETTINGS.name,
    Icon: SettingsIcon,
  },
  {
    path: pages.SignIn.path,
    title: pages.LOGOUT.name,
    Icon: LogoOutIcon,
  },
]

export interface NavSubItemType {
  title: string
  action?: (navigate?: NavigateFunction) => void
}
export interface NavItemType {
  path: string
  title: string
  Icon: React.FC<{ fill: string }>
  isSoon?: boolean
  subItems?: NavSubItemType[]
}

export function NavPanel() {
  const navigate = useNavigate()
  const userInfo = useUnit($userInfo)
  const isMobileNavOpen = useUnit($isMobileNavOpen)
  const { currentBreakpointPairs, isMobilePairs, isTabletPairs } = useCurrentBreakpointPairs()

  const isTabletAndMobile = [BREAKPOINT_PAIRS.tablet, BREAKPOINT_PAIRS.mobile].includes(currentBreakpointPairs)

  useEffect(() => {
    if (!userInfo.email) {
      const userToken = getToken()

      userToken && getUserInfoFx()
    }
  }, [])

  const token = getToken()

  const navItemsStart = () => {
    let navState: string[]

    switch (theme) {
      case themeValue.kaizen:
        navState = KaizenNavState
        break
      case themeValue.biz:
        navState = BizNavState
        break
      case themeValue.pairs:
        navState = PairsNavState
        break
      default:
        navState = PairsNavState
    }

    const navItems = navState.map(item => {
      return navItemsStartObject[item]
    })

    return navItems
  }

  const handleCloseMenu = () => {
    setIsMobileNavOpenEV(false)
  }

  const toggleMenu = () => {
    setIsMobileNavOpenEV(!isMobileNavOpen)
  }

  const mobileNavPanelClose = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if ((e.target as HTMLElement).id === 'mobileNavContainer') handleCloseMenu()
  }

  return (
    <>
      {!isTabletAndMobile ? (
        <section className={clsx(styles.mainNavPanel, !isMobileNavOpen && styles.deActivePanel)}>
          <div className={clsx(styles.navLinksContainer, styles.mobSecondContainer)}>
            <img src={themeLogo()} alt='' className={styles.bbLogo} />
            {navItemsStart().map(({ path, title, Icon, isSoon }) => {
              return <NavItem key={title} path={path} title={title} Icon={Icon} isSoon={isSoon} />
            })}
          </div>

          <div className={styles.navLinksContainer}>
            <StepUpUnlockTimer />

            {token
              ? navItemsEnd.map(({ path, title, Icon }) => {
                  return <NavItem key={title} path={path} title={title} Icon={Icon} />
                })
              : null}
          </div>
        </section>
      ) : null}

      {isTabletAndMobile ? (
        <>
          <section className={styles.mainNavPanelMobile}>
            <img src={themeLogo()} onClick={() => navigate(pages.Base.path)} alt='' className={styles.bbLogoMobile} />
            <div onClick={toggleMenu} className={styles.navBurgerBtn}>
              <div className={styles.navBurgerLine} />
              <div className={styles.navBurgerLine} />
              <div className={styles.navBurgerLine} />
            </div>
          </section>

          <div
            className={clsx(styles.mobileNavPanelContainer, { [styles.open]: isMobileNavOpen })}
            id='mobileNavContainer'
            onClick={mobileNavPanelClose}
          >
            <section className={styles.mobileNavPanel}>
              <div className={styles.mobileNavPanelHader}>
                <div>
                  {isMobilePairs ? (
                    <img
                      src={themeLogo()}
                      onClick={() => navigate(pages.Base.path)}
                      alt=''
                      className={styles.bbLogoMobile}
                    />
                  ) : null}
                </div>
                <div onClick={handleCloseMenu} className={styles.closeButton}></div>
              </div>

              <nav className={styles.mobileNavPanelContent}>
                <ul className={styles.mobileNavPanelLinks}>
                  {navItemsStart().map(({ path, title, isSoon, Icon, subItems }) => {
                    return (
                      <NavItem key={title} path={path} title={title} isSoon={isSoon} subItems={subItems} Icon={Icon} />
                    )
                  })}
                </ul>
                <ul className={styles.mobileNavPanelLinks}>
                  {navItemsEnd.map(({ path, title, Icon }) => {
                    return <NavItem key={title} path={path} title={title} Icon={Icon} />
                  })}
                </ul>
              </nav>
            </section>
          </div>
        </>
      ) : null}
    </>
  )
}
