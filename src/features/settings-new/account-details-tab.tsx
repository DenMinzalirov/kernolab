import { ChangePassword } from './change-password'
import { DeleteAccount } from './delete-account'
import { Referral } from './referral-new'
import styles from './styles.module.scss'
import { TabSettingsTitle } from './tab-settings-title'
import { UserEmail } from './user-email'
import { UserPhone } from './user-phone'

export function AccountDetailsTab() {
  return (
    <div className={styles.tabSettingsWrap}>
      <TabSettingsTitle
        title={'Account Details'}
        description={
          'Manage your account settings with ease. Update your email, change your password or add a phone number. You can also access your referral code or, if needed, delete your account.'
        }
      />
      <div className={styles.settingsTabContent}>
        <UserEmail />
        <ChangePassword />
        <UserPhone />
        <Referral />
        <DeleteAccount />
      </div>
    </div>
  )
}
