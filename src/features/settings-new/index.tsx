import { useState } from 'react'
import clsx from 'clsx'

import { HeaderTitle } from 'components'

import { API_BASE_URL } from '../../config'
import { AccountDetailsTab } from './account-details-tab'
import { AppearanceTab } from './appearance-tab'
import { SecurityTab } from './security-tab'
import styles from './styles.module.scss'

const SETTINGS_TAB = {
  APPEARANCE: 'Appearance',
  ACCOUNT_DETAILS: 'Account\u00A0Details',
  SECURITY: 'Security',
}

const Settings = () => {
  let isDev = false
  if (API_BASE_URL.includes('dev')) {
    isDev = true
  }
  if (API_BASE_URL.includes('staging')) {
    isDev = true
  }

  const [activeTab, setActiveTab] = useState(SETTINGS_TAB.APPEARANCE)

  const handleActive = (tabName: string) => {
    setActiveTab(tabName)
  }

  return (
    <div
      // className={styles.settingsWrap}
      className='page-container-pairs'
    >
      <HeaderTitle headerTitle='Settings' />
      <div className={styles.settingsItemsWrap}>
        <div className={styles.settingsNavMenu}>
          {Object.values(SETTINGS_TAB).map(settingItemName => {
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
        <div style={{ flexGrow: 1 }}>
          {activeTab === SETTINGS_TAB.APPEARANCE ? <AppearanceTab /> : null}
          {activeTab === SETTINGS_TAB.ACCOUNT_DETAILS ? <AccountDetailsTab /> : null}
          {activeTab === SETTINGS_TAB.SECURITY ? <SecurityTab /> : null}
        </div>
      </div>
    </div>
  )
}

export default Settings
