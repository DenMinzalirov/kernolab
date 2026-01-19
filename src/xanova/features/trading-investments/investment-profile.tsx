import { useUnit } from 'effector-react'

import { $tradingInvestmentsForm } from 'model/xanova-forms'

import { goSupportXanova } from '../../../config'
import { formattedDateXanova } from '../../urils/formattedDateXanova'
import styles from './styles.module.scss'
import loaderIcon from './system-uicons_loader.svg'

export function InvestmentProfile() {
  const tradingInvestmentsForm = useUnit($tradingInvestmentsForm)
  const formData = tradingInvestmentsForm.data

  const formatAmountRange = (value: string): string => {
    const options: Record<string, string> = {
      '5000-15000': '$5k–$15k',
      '15000-30000': '$15k–$30k',
      '30000+': '$30k–$50k+',
    }
    return options[value] || value
  }

  const formatRiskTolerance = (value: string): string => {
    const options: Record<string, string> = {
      conservative: 'Conservative',
      moderate: 'Moderate',
      'moderate-high': 'Moderate-High',
    }
    return options[value] || value
  }

  const formatTimeHorizon = (value: string): string => {
    const options: Record<string, string> = {
      '1-5-years': '1-5 years',
      '1-3-years': '1-3 years',
    }
    return options[value] || value
  }

  return (
    <section className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <div className={styles.profileSpinner}>
          <img src={loaderIcon} alt='Loading' className={styles.spinnerIcon} />
        </div>

        <div className={styles.profileTitle}>Investment Onboarding is in Progress</div>

        <div className={styles.profileDescription}>
          Onboarding usually takes up to 48 hours.{'\n'}Our investment services team is preparing your account. You will
          contacted shortly with&nbsp;the&nbsp;next steps.
        </div>

        <div className={styles.profileInfoBlock}>
          <div className={styles.profileInfoString}>
            <div className={styles.profileInfoTitle}>Submitted amount range:</div>
            <div className={styles.profileInfoData}>{formatAmountRange(formData?.investmentAmountRange || '')}</div>
          </div>
          <div className={styles.profileInfoString}>
            <div className={styles.profileInfoTitle}>Risk tolerance:</div>
            <div className={styles.profileInfoData}>{formatRiskTolerance(formData?.riskTolerance || '')}</div>
          </div>
          <div className={styles.profileInfoString}>
            <div className={styles.profileInfoTitle}>Time horizon:</div>
            <div className={styles.profileInfoData}>{formatTimeHorizon(formData?.timeHorizon || '')}</div>
          </div>
        </div>

        <p className={styles.profileContactSupport}>
          Need help or updates? <a onClick={goSupportXanova}>Contact Support</a>
        </p>
      </div>
    </section>
  )
}
