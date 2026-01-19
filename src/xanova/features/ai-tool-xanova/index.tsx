import { useState } from 'react'
import { useUnit } from 'effector-react'

import { $aiToolForm, XanovaFormStatus } from '../../../model/xanova-forms'
import { AiToolXanovaApproved } from './approved'
import { AiToolXanovaForm } from './form'
import styles from './styles.module.scss'

export function AiToolXanova() {
  const aiToolForm = useUnit($aiToolForm)

  const [stage, setStage] = useState<'initial' | 'form' | 'success' | 'approved'>('initial')

  if (aiToolForm?.status === XanovaFormStatus.LOADED && !!aiToolForm.data) {
    return (
      <div className={styles.container}>
        <AiToolXanovaApproved />
      </div>
    )
  }

  if (aiToolForm?.status === XanovaFormStatus.LOADING) {
    return null
  }

  return (
    <div className={styles.container}>
      {stage === 'initial' && (
        <div className={styles.content}>
          <div className={styles.flexVerticalCenterGap4}>
            <h1 className={styles.title}>AI Marketing Tool</h1>
            <p className={styles.subTitle}>
              Access automated marketing support powered by AI. Customize your preferences and receive your activation
              credentials by email within&nbsp;24&nbsp;hours.
            </p>
          </div>
          <button className='btn-xanova big gold' onClick={() => setStage('form')}>
            Start Submission
          </button>
        </div>
      )}

      {stage === 'form' && <AiToolXanovaForm />}
    </div>
  )
}
