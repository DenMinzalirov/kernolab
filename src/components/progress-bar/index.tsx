import { HTMLAttributes } from 'react'
import clsx from 'clsx'

import styles from './styles.module.scss'

export interface ProgressBar extends HTMLAttributes<HTMLDivElement> {
  value: number
  isModal?: boolean
  customColor?: string
  isBig?: boolean
}

export function ProgressBar({ value, isModal, customColor, isBig, ...props }: ProgressBar) {
  return (
    <div
      className={clsx(styles.progressBar, isBig && styles.height8)}
      style={{
        ...(isModal ? { height: isBig ? 8 : 4 } : {}),
      }}
      {...props}
    >
      <div
        className={styles.progressBarFill}
        style={{
          width: `${value ? value : 0}%`,
          ...(customColor ? { backgroundColor: customColor } : {}),
        }}
      />
    </div>
  )
}
