import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

import { CompleteIcon } from 'icons'

import styles from './styles.module.scss'

export interface CompleteIconBlur extends HTMLAttributes<HTMLDivElement> {
  isMobile?: boolean
}

export function CompleteIconBlur({ isMobile, className, ...props }: CompleteIconBlur) {
  return (
    <div className={clsx(styles.completeIconBlurWrap, className)} {...props}>
      <div className={styles.completeIconBlur}>
        <CompleteIcon isMobile={isMobile} fill='var(--P-System-Green)' />
      </div>
      <div className={styles.blurEffect} />
    </div>
  )
}
