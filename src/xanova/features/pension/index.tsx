import styles from './styles.module.scss'
import { StatusPill } from 'xanova/components/status-pill'

export function PensionXanova() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.flexVerticalCenterGap4}>
          <div className={styles.statusPillWrap}>
            <StatusPill status={'pending'} label='Coming Soon' />
          </div>
          <h1 className={styles.title}>Personal Pension Plan</h1>
          <p className={styles.subTitle}>
            Build long-term retirement savings with&nbsp;a&nbsp;trusted provider. Pension setup, KYC, and contributions
            are handled directly by&nbsp;Allianz. Pension plans are created and managed on&nbsp;the&nbsp;Allianz portal.
            Xanova does not collect or store any of your pension data.
          </p>
        </div>
        {/* TODO: add link */}
        <button className='btn-xanova big gold' disabled>
          Go to Allianz Portal
        </button>
      </div>
    </div>
  )
}
