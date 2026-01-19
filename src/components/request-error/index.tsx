import { HTMLAttributes } from 'react'

import { DangerIcon } from 'icons'

import styles from './styles.module.scss'

export interface RequestError extends HTMLAttributes<HTMLDivElement> {
  requestError: string
}

export function RequestError({ requestError, ...props }: RequestError) {
  return (
    <div className={styles.requestErrorWrap} {...props}>
      <div className={styles.requestErrorIcon}>
        <DangerIcon />
      </div>
      <div className={styles.requestErrorInfo}>{requestError}</div>
    </div>
  )
}
