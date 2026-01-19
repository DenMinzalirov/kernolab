import { CompleteIconBlur } from 'components'

import styles from './styles.module.scss'

export const OtcStepSuccess = () => {
  return (
    <div className={styles.stepSuccess}>
      <CompleteIconBlur />
      <div className={styles.stepSuccessTitle}>OTC Trade Requested Successfully</div>
      <div className={styles.stepSuccessSubTitle}>
        Please follow futher instructions to complete your deposit and proceed with the offer.
      </div>
    </div>
  )
}
