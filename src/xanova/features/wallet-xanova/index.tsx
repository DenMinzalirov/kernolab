import styles from './styles.module.scss'
import { StatusPill } from 'xanova/components/status-pill'

export function WalletXanova() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.flexVerticalCenterGap4}>
          <div className={styles.statusPillWrap}>
            <StatusPill status={'pending'} label='Coming Soon' />
          </div>
          <h1 className={styles.title}>Wallet Access</h1>
          <p className={styles.subTitle}>
            Your wallet will allow you to manage crypto assets and receive commission payouts in&nbsp;USDC. Integration
            with our custody provider is coming soon.
          </p>
        </div>
        <button className='btn-xanova big gold' disabled>
          Access Wallet
        </button>
      </div>
    </div>
  )
}
