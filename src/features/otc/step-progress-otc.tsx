import { useEffect, useState } from 'react'

import { ConfigStepType, STEPS_OTC, StepType } from './otc-new-request'
import styles from './styles.module.scss'

type Props = {
  configStep: ConfigStepType
  currentStep: string
}

export function StepProgressOtc({ configStep, currentStep }: Props) {
  const configStepsArray: StepType[] = Object.values(configStep).filter(step => step.id !== STEPS_OTC.SUCCESS)
  const totalSteps = configStepsArray.length - 1
  const [activeStep, setActiveStep] = useState(3)

  const width = `${(50 / (totalSteps - 1)) * (+activeStep - 1)}%`

  useEffect(() => {
    const active = configStepsArray.find(step => step.id === currentStep) //TODO control step
    setActiveStep(active?.value || 0)
  }, [currentStep])

  return (
    <div className={styles.stepProgressContainer}>
      <div className={styles.stepProgress}>
        <div className={styles.stepProgressActiveLine} style={{ width }} />
        {configStepsArray.map(step => {
          return (
            <div className={styles.stepProgressStepWrapper} key={step.value}>
              <div
                className={styles.stepProgressStepStyle}
                style={{
                  background: `${activeStep >= step.value ? 'var(--mainBlue)' : '#d9defe'}`,
                }}
              />
              <div className={styles.stepProgressLabelContainer}>
                <div className={activeStep >= step.value ? styles.stepProgressLabelActive : styles.stepProgressLabel}>
                  {step.label}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
