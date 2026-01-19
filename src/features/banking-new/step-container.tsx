import React, { useEffect, useState } from 'react'
import { useUnit } from 'effector-react'

import { $cardStatus } from 'model/cefi-banking'

import { CardService } from '../../wip/services'
import styles from './styles.module.scss'

const stepsName: Record<string, string> = {
  RESIDENCY: 'Country',
  KYC: 'KYC',
  DEPOSIT: 'Deposit',
  ADDRESS: 'Address',
  PHONE: 'Mobile',
  TERMS: 'Terms',
  SUBMITTED: 'Terms',
}

const steps = [
  {
    label: stepsName.RESIDENCY,
    step: 1,
    value: 'RESIDENCY',
  },
  {
    label: stepsName.KYC,
    step: 2,
    value: 'KYC',
  },
  {
    label: stepsName.DEPOSIT,
    step: 3,
    value: 'DEPOSIT',
  },
  {
    label: stepsName.ADDRESS,
    step: 4,
    value: 'ADDRESS',
  },
  {
    label: stepsName.PHONE,
    step: 5,
    value: 'PHONE',
  },
  {
    label: stepsName.TERMS,
    step: 6,
    value: 'TERMS',
  },
  {
    label: stepsName.SUBMITTED,
    step: 6,
    value: 'SUBMITTED',
  },
]

export function StepContainer() {
  const cardStatus = useUnit($cardStatus)

  const totalSteps = steps.length - 1
  const [activeStep, setActiveStep] = useState(5)
  const [mainSteps, setMainSteps] = useState(steps)

  const width = `${(99 / (totalSteps - 1)) * (+activeStep - 1)}%`

  useEffect(() => {
    const active = mainSteps.find(step => step.value === cardStatus?.nextStep)
    setActiveStep(active?.step || 0)
    CardService.getOrderCardSteps()
      .then(res => {
        const updatedTemplate = res.map((item, index) => ({
          label: stepsName[item],
          // fix for only last step for UI (have 6 points)
          step: index === 6 ? index : index + 1,
          value: item,
        }))
        setMainSteps(updatedTemplate)
      })
      .catch(e => console.log('ERROR-getOrderCardSteps', e))
  }, [cardStatus])

  if (cardStatus.currentStep === 'COUNTRY_BLOCKED') {
    return null
  }

  return (
    <div className={styles.mainStepContainer}>
      <div className={styles.stepContainer}>
        <div className={styles.activeLine} style={{ width }} />
        {mainSteps.map(({ step, label, value }) => {
          if (value === 'SUBMITTED') return null
          return (
            <div className={styles.stepWrapper} key={value}>
              <div
                className={styles.stepStyle}
                style={{
                  backgroundColor: `${activeStep >= step ? 'var(--Deep-Space)' : '#E8E8E8'}`,
                  color: 'white',
                }}
              >
                <div className={styles.stepNumber}>{step}</div>
              </div>
              <div className={styles.stepsLabelContainer}>
                <div className={activeStep >= step ? styles.stepLabelActive : styles.stepLabel} key={value}>
                  {label}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
