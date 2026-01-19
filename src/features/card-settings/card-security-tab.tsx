import { AtmWithdrawals } from './atm-withdrawals'
import { ContactlessPayment } from './contactless-payment'
import { OnlineTransactions } from './online-transactions'
import { Password3DS } from './passwoed-3ds'
import styles from './styles.module.scss'
import { TabSettingsTitle } from './tab-settings-title'

export function CardSecurityTab() {
  return (
    <div className={styles.tabSettingsWrap}>
      <TabSettingsTitle
        title={'Security Settings'}
        description={
          'Manage your card security settings to ensure safe transactions. Control contactless payments,\u00A0ATM withdrawals, online transactions, and access your 3DS password.'
        }
      />
      <div className={styles.settingsTabContent}>
        <Password3DS />
        <ContactlessPayment />
        <AtmWithdrawals />
        <OnlineTransactions />
        {/* TODO: add isPin if selectedCatd === 'Physical' */}
      </div>
    </div>
  )
}
