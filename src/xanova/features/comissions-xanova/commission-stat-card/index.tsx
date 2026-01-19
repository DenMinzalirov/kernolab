import clsx from 'clsx'

import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'

import styles from './styles.module.scss'

type CommissionStatCardProps = {
  title: string
  value: string
  subText?: string
  className?: string
  isLoading?: boolean
}

// только для Commission в desktop версии

export function CommissionStatCard({ title, value, subText, className, isLoading }: CommissionStatCardProps) {
  if (isLoading) {
    return (
      <div className={clsx(styles.commissionStatCard, className, styles.commissionStatCardSkeleton)}>
        <span className={clsx(styles.commissionStatCardSkeletonBar, styles.commissionStatCardSkeletonBarLarge)} />
        <span className={clsx(styles.commissionStatCardSkeletonBar, styles.commissionStatCardSkeletonBarSmall)} />
      </div>
    )
  }

  const formatValue = (+value || 0).toString()
  const valueForDisplay = addCommasToDisplayValue(formatValue, 2)
  return (
    <div className={clsx(styles.commissionStatCard, className)}>
      <div className={styles.commissionStatCardTitle}>{title}</div>
      <span className={styles.commissionStatCardValue}>${valueForDisplay}</span>
      {subText ? <span className={styles.commissionStatCardSubText}>{subText}</span> : null}
    </div>
  )
}
