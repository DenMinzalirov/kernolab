import { GlobalLogOut } from './global-log-out'
import styles from './styles.module.scss'
import { TabSettingsTitle } from './tab-settings-title'
import { TwoFactorAuthentication } from './two-factor-authentication'
import { Whitelist } from './whitelist'

export function SecurityTab() {
  return (
    <div className={styles.tabSettingsWrap}>
      <TabSettingsTitle
        title={'Security Settings'}
        description={
          'Enhance your account security by managing key settings. Enable Two-Factor Authentication, log out from\u00A0all devices, or manage your whitelist for added protection.'
        }
      />
      <div className={styles.settingsTabContent}>
        <TwoFactorAuthentication />
        <Whitelist />
        <GlobalLogOut />
      </div>
    </div>
  )
}
