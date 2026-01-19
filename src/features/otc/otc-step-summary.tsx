import { OtcNewRequestForm } from './otc-new-request'
import styles from './styles.module.scss'

type Props = {
  formData: OtcNewRequestForm
}

export const OtcStepSummary = ({ formData }: Props) => {
  const { amount, fromAsset, toAsset, phone, email, name } = formData

  return (
    <div className={styles.stepOneContainer}>
      <div style={{ height: 68 }}></div>
      <div className={styles.stepOneTitle}>Confirm Details</div>

      <div style={{ height: 86 }}></div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className={styles.summaryTitle}>Trade Details:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className={styles.summaryKeyText}>from</div>
              <div className={styles.summaryValueText}>
                {amount} {fromAsset?.assetId}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className={styles.summaryKeyText}>to</div>
              <div className={styles.summaryValueText}>{toAsset?.assetId}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className={styles.summaryTitle}>Contact Details:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className={styles.summaryKeyText}>Phone Number</div>
              <div className={styles.summaryValueText}>{phone}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className={styles.summaryKeyText}>Email</div>
              <div className={styles.summaryValueText}>{email}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className={styles.summaryKeyText}>Full Name</div>
              <div className={styles.summaryValueText}>{name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
