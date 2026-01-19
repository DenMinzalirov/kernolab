import { ReactNode } from 'react'
import clsx from 'clsx'

import styles from './styles.module.scss'

type StepStatus = 'completed' | 'active' | 'upcoming'

type StepXanova = {
  label: string
  value: string
}

type StepsLayoutXanovaProps = {
  steps: StepXanova[]
  activeStep?: string // по значению шага или success
  children: ReactNode
  className?: string
  stepsClassName?: string
  contentClassName?: string
}

const stepItemStatusClass: Record<StepStatus, string> = {
  completed: styles.stepItemCompleted,
  active: styles.stepItemActive,
  upcoming: styles.stepItemUpcoming,
}

const stepMarkerStatusClass: Record<StepStatus, string> = {
  completed: styles.stepMarkerCompleted,
  active: styles.stepMarkerActive,
  upcoming: styles.stepMarkerUpcoming,
}

export function StepsLayoutXanova({
  steps,
  activeStep,
  children,
  className,
  stepsClassName,
  contentClassName,
}: StepsLayoutXanovaProps) {
  const totalSteps = steps.length
  const fallbackActiveValue = steps[0]?.value ?? ''
  const rawActiveStep = typeof activeStep === 'string' ? activeStep : fallbackActiveValue
  const normalizedActiveStep = rawActiveStep.trim().toLowerCase()

  const shouldMarkAllCompleted = normalizedActiveStep === 'complete' || normalizedActiveStep === 'success'

  const activeStepIndex = shouldMarkAllCompleted
    ? Math.max(totalSteps - 1, 0)
    : steps.findIndex(step => step.value.trim().toLowerCase() === normalizedActiveStep)

  const resolvedActiveStepIndex = activeStepIndex === -1 ? (totalSteps > 0 ? 0 : -1) : activeStepIndex

  const resolveStepStatus = (stepIndex: number): StepStatus => {
    if (shouldMarkAllCompleted) return 'completed'
    if (resolvedActiveStepIndex === -1) return 'upcoming'
    if (stepIndex < resolvedActiveStepIndex) return 'completed'
    if (stepIndex === resolvedActiveStepIndex) return 'active'

    return 'upcoming'
  }

  return (
    <div className={clsx(styles.containerLayout, className)}>
      <div className={clsx(styles.stepsWrapper, stepsClassName)} role='list'>
        {steps.map(({ label, value }, index) => {
          const status = resolveStepStatus(index)

          return (
            <div
              key={value}
              className={clsx(styles.stepItem, stepItemStatusClass[status])}
              role='listitem'
              aria-current={status === 'active' ? 'step' : undefined}
            >
              <span className={clsx(styles.stepMarker, stepMarkerStatusClass[status])}>
                {status === 'upcoming' && (
                  <span className={styles.stepMarkerNumber} aria-hidden>
                    {index + 1}
                  </span>
                )}
              </span>
              <span className={clsx(styles.stepLabel, status === 'upcoming' && styles.opacity60)}>{label}</span>
            </div>
          )
        })}
      </div>
      <div className={clsx(styles.contentWrapper, contentClassName)}>
        <div className={styles.contentInner}>{children}</div>
      </div>
    </div>
  )
}
