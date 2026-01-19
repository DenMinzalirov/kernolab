import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { HeaderTitle } from 'components'
import { pages } from 'constant'
import { $selectedCardUuid } from 'model/cefi-banking'

import { CardFees } from './card-fees'
import { CardLimits } from './card-limits'
import { CardSecurityTab } from './card-security-tab'
import styles from './styles.module.scss'

export const CARD_SETTINGS_TAB = {
  SECURITY: 'Security',
  LIMITS: 'Limits',
  FEES: 'Fees',
}

export function CardSettings() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedCardUuid = useUnit($selectedCardUuid)

  const [activeTab, setActiveTab] = useState(location.state?.tab || CARD_SETTINGS_TAB.SECURITY)

  useEffect(() => {
    if (!selectedCardUuid) {
      navigate(pages.CARD.path)
    }
  }, [])

  const handleActive = (tabName: string) => {
    setActiveTab(tabName)
  }

  return (
    <div
      // className={styles.page}
      className='page-container-pairs'
    >
      {/*<div className={styles.headerWrap}>*/}
      <HeaderTitle headerTitle='Settings' showBackBtn />
      {/*</div>*/}
      <div className={styles.settingsItemsWrap}>
        <div className={styles.settingsNavMenu}>
          {Object.values(CARD_SETTINGS_TAB).map(settingItemName => {
            return (
              <div key={settingItemName}>
                <div
                  onClick={() => handleActive(settingItemName)}
                  className={clsx(styles.settingsMenuItem, {
                    [styles.settingsMenuItemActive]: settingItemName === activeTab,
                  })}
                >
                  {settingItemName}
                </div>
              </div>
            )
          })}
        </div>
        <div className={styles.tabsContainer}>
          {activeTab === CARD_SETTINGS_TAB.SECURITY ? <CardSecurityTab /> : null}
          {activeTab === CARD_SETTINGS_TAB.LIMITS ? <CardLimits /> : null}
          {activeTab === CARD_SETTINGS_TAB.FEES ? <CardFees /> : null}
        </div>
      </div>
    </div>
  )
}
