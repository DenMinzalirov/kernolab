import { Currency } from './currency-new'
import styles from './styles.module.scss'
import { TabSettingsTitle } from './tab-settings-title'
import Version from './version-new'

export function AppearanceTab() {
  return (
    <div className={styles.tabSettingsWrap}>
      <TabSettingsTitle
        title={'Appearance Settings'}
        description={
          'Customize how your account looks and functions by adjusting appearance preferences. You can switch your account currency or check your current web app version below.'
        }
      />

      <div className={styles.settingsTabContent}>
        <Currency />
        <Version />
      </div>
    </div>
  )
}
