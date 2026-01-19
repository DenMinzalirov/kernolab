import styles from './styles.module.scss'
import { OtcNewRequestForm } from './typeAndConstant'

type Props = {
  formData: OtcNewRequestForm
}

export const OtcStepSummaryBiz = ({ formData }: Props) => {
  const { amount, fromAsset, toAsset, phone, email, name } = formData

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.summaryColumn}>
        <div className={styles.summaryTitle}>Trade Details:</div>
        <div className={styles.summaryColumn}>
          <div className={styles.summaryRow}>
            <div className={styles.summaryKeyText}>From</div>
            <div className={styles.summaryValueText}>
              {amount} {fromAsset?.assetId}
            </div>
          </div>
          <div className={styles.summaryRow}>
            <div className={styles.summaryKeyText}>To</div>
            <div className={styles.summaryValueText}>{toAsset?.assetId}</div>
          </div>
        </div>
      </div>

      <div className={styles.summaryColumn}>
        <div className={styles.summaryTitle}>Contact Details:</div>
        <div className={styles.summaryColumn}>
          <div className={styles.summaryRow}>
            <div className={styles.summaryKeyText}>Phone Number</div>
            <div className={styles.summaryValueText}>{phone}</div>
          </div>
          <div className={styles.summaryRow}>
            <div className={styles.summaryKeyText}>Email</div>
            <div className={styles.summaryValueText}>{email}</div>
          </div>
          <div className={styles.summaryRow}>
            <div className={styles.summaryKeyText}>Full Name</div>
            <div className={styles.summaryValueText}>{name}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
