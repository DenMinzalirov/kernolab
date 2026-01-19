import { useUnit } from 'effector-react'

import { goSupportXanova } from '../../../config'
import { $aiToolForm } from '../../../model/xanova-forms'
import { formattedDateXanova } from '../../urils/formattedDateXanova'
import { languagesAiForm } from './form'
import styles from './styles.module.scss'
import { StatusPill } from 'xanova/components/status-pill'

export function AiToolXanovaApproved() {
  const aiToolForm = useUnit($aiToolForm)

  const getLanguageLabel = (languageValue?: string): string => {
    const language = languagesAiForm.find(lang => lang.value === languageValue)
    return language?.label || 'English'
  }

  const handleGoToAiTool = () => {}

  return (
    <div className={styles.content}>
      <div className={styles.flexVerticalCenterGap4}>
        <div className={styles.statusPillWrap}>
          <StatusPill status={'pending'} label='Coming Soon' />
        </div>
        <h1 className={styles.title}>AI Marketing Tool</h1>
        <p className={styles.subTitle}>
          Your AI Tool account has been activated.
          <br />
          Use the link below to log in with the credentials sent&nbsp;to your email.
        </p>
      </div>

      <div className={styles.info}>
        <div className={styles.infoRow}>
          <div className={styles.infoText}>Language:</div>
          <div className={styles.infoSubText}>{getLanguageLabel(aiToolForm?.data?.language)}</div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.infoText}>Business Focus:</div>
          <div className={styles.infoSubText}>Insurance</div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.infoText}>Credentials:</div>
          <div className={styles.infoSubText}>
            Sent on {formattedDateXanova(aiToolForm?.data?.createdAt || new Date().toISOString())}
          </div>
        </div>
      </div>

      <div className={styles.buttonsWrap}>
        <button disabled className='btn-xanova big gold' onClick={handleGoToAiTool}>
          Go to AI Tool
        </button>
        <button disabled className='btn-xanova big grey' onClick={goSupportXanova}>
          Resend Credentials
        </button>
        <p className={styles.contactSupport}>
          Need help or updates? <a onClick={goSupportXanova}>Contact Support</a>
        </p>
      </div>
    </div>
  )
}
