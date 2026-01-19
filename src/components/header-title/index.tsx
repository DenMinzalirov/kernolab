import { HTMLAttributes } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { pages } from 'constant'
import { TYPE_TXN_HISTORY } from 'features/transactions-history/constants'
import { HELP_LINKS } from 'config'
import { $selectedCardUuid } from 'model/cefi-banking'
import transactions from 'assets/icons/transactions.svg'

import styles from './styles.module.scss'

export interface HeaderTitle extends HTMLAttributes<HTMLDivElement> {
  headerTitle: string
  showBackBtn?: boolean
  backBtnTitle?: string
  backBtnAction?: () => void
  btnsOptions?: {
    title: string
    action: () => void
  }[]
}

export function HeaderTitle({ headerTitle, showBackBtn, backBtnTitle, backBtnAction, btnsOptions }: HeaderTitle) {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedCardUuid = useUnit($selectedCardUuid)

  const isLaunchpad = location.pathname.includes(pages.LAUNCHPAD.path)
  const isLaunchpadPurchase = location.pathname.includes(pages.LAUNCHPAD_PURCHASE.path)
  const isWhitelist = location.pathname.includes(pages.WHITELIST.path)
  const isEarn = location.pathname.includes(pages.EARN.path)
  const isCard = location.pathname.includes(pages.CARD.path)
  const transactionsShow: Array<string> = [pages.Base.path, pages.EARN.path, pages.PORTFOLIO.path]

  const hendleLaunchProject = () => {
    window.open(HELP_LINKS.LAUNCH_A_PROJECT)
  }

  const getPreviousPageName = () => {
    if (backBtnTitle) {
      return backBtnTitle
    } else if (isLaunchpad) {
      return 'Launchpad'
    } else if (isWhitelist) {
      return 'Settings'
    } else if (
      ([pages.NEW_EARNING.path, pages.EARN.path, pages.NEW_SUPERCHARGE.path] as Array<string>).includes(
        location.pathname
      )
    ) {
      return 'Earn'
    } else {
      return 'Portfolio'
    }
  }

  const handleBackButton = () => {
    if (backBtnAction) {
      backBtnAction()
    } else {
      navigate(-1)
    }
  }

  const previousPageName = getPreviousPageName()

  return (
    <div className={clsx(styles.headerWrap, showBackBtn && styles.headerWrapBackBtn)}>
      {showBackBtn ? (
        <div className={styles.backBtn} onClick={handleBackButton}>
          <span>
            {`<`} {previousPageName}
          </span>
          /<p className={styles.backBtnSubText}>&nbsp;{headerTitle}</p>
        </div>
      ) : (
        <p className={styles.title}>{headerTitle}</p>
      )}

      <div className={styles.actionBtnGroup}>
        {transactionsShow.includes(location.pathname) || (isCard && selectedCardUuid) ? (
          <div
            onClick={() =>
              navigate(pages.TRANSACTIONS_HISTORY.path, {
                state: {
                  type: isEarn ? TYPE_TXN_HISTORY.STAKING : isCard ? TYPE_TXN_HISTORY.CARD : TYPE_TXN_HISTORY.CRYPTO,
                },
              })
            }
            className={styles.transactionsBtn}
          >
            <img style={{ marginRight: 12 }} src={transactions} alt='' />
            Transactions
          </div>
        ) : null}

        {isLaunchpad && !isLaunchpadPurchase ? (
          <button className={styles.launchBtn} onClick={hendleLaunchProject}>
            Launch a project
          </button>
        ) : null}

        {btnsOptions?.length
          ? btnsOptions.map(({ title, action }) => (
              <button key={title} onClick={action} className={styles.transactionsBtn}>
                {title}
              </button>
            ))
          : null}
      </div>
    </div>
  )
}
