import { goSupportXanova } from '../../../config'
import { XanovaFormData } from '../../../model'
import { formattedDateXanova } from '../../urils/formattedDateXanova'
import styles from './styles.module.scss'

type Props = {
  formData: XanovaFormData | null
  formName: string
}

export function ReceivedForm({ formData, formName }: Props) {
  const capitalize = (value: string | string[]): string => {
    const capitalizeString = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

    if (Array.isArray(value)) {
      return value.map(capitalizeString).join(' / ')
    }
    return capitalizeString(value)
  }

  const formatRevenueRange = (value: string): string => {
    const formatNumber = (num: number): string => {
      if (num >= 1000000) {
        return `$${num / 1000000}M`
      }
      return `$${num / 1000}k`
    }

    const matches = value.match(/[\d,]+/g)
    if (!matches || matches.length < 2) return value

    const min = parseInt(matches[0].replace(/,/g, ''), 10)
    const max = parseInt(matches[1].replace(/,/g, ''), 10)

    return `${formatNumber(min)}–${formatNumber(max)}`
  }

  return (
    <div className={styles.content}>
      <div className={styles.titleWrap}>
        <div className={styles.createdText}>
          Last updated: {formattedDateXanova(formData?.createdAt || new Date().toISOString())}
        </div>
        <div className={styles.title}>Your Consulting Request{'\n'}has been received</div>
        <div className={styles.descriptionText}>You’ll receive all the details by email shortly</div>
      </div>
      <div className={styles.infoBlock}>
        <div className={styles.infoString}>
          <div className={styles.infoTitle}>Service:</div>
          <div className={styles.infoData}>{formName}</div>
        </div>
        <div className={styles.infoString}>
          <div className={styles.infoTitle}>Business Type:</div>
          <div className={styles.infoData}>{capitalize(formData?.businessType || '')}</div>
        </div>
        <div className={styles.infoString}>
          <div className={styles.infoTitle}>Fiscal Country:</div>
          <div className={styles.infoData}>{capitalize(formData?.country || '')}</div>
        </div>
        <div className={styles.infoString}>
          <div className={styles.infoTitle}>Revenue Range:</div>
          <div className={styles.infoData}>{formatRevenueRange(formData?.revenueRange || '')}</div>
        </div>
        <div className={styles.infoString}>
          <div className={styles.infoTitle}>Preferred Contact:</div>
          <div className={styles.infoData}>{capitalize(formData?.contactMethod || '')}</div>
        </div>
      </div>
      <p className={styles.contactSupport}>
        Need help or updates? <a onClick={goSupportXanova}>Contact Support</a>
      </p>
    </div>
  )
}
