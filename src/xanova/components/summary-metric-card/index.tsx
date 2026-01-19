import clsx from 'clsx'

import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'

import styles from './styles.module.scss'

type MetricCardProps = {
  title: string
  value: string
  subText?: string
  isLoading?: boolean
  className?: string
}

export function SummaryMetricCard({ title, value, subText, isLoading, className }: MetricCardProps) {
  const formatValue = (+value || 0).toString()
  const valueForDisplay = addCommasToDisplayValue(formatValue, 2)

  if (isLoading) {
    return (
      <div className={clsx(styles.metricCard, styles.metricCardSkeleton, className)}>
        <span className={clsx(styles.metricCardSkeletonBar, styles.metricCardSkeletonBarLarge)} />
        <span className={clsx(styles.metricCardSkeletonBar, styles.metricCardSkeletonBarSmall)} />
      </div>
    )
  }

  return (
    <div className={clsx(styles.metricCard, className)}>
      <div className={styles.metricCardTitle}>{title}</div>
      <span className={styles.metricCardValue}>${valueForDisplay}</span>
      {subText ? <span className={styles.metricCardSubText}>{subText}</span> : null}
    </div>
  )
}
