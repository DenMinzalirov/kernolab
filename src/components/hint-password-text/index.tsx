import { HTMLAttributes } from 'react'
import clsx from 'clsx'

import styles from './styles.module.scss'

export interface HintPasswordText extends HTMLAttributes<HTMLDivElement> {
  text: string
  errors: string
}

export function HintPasswordText({ text, errors, ...props }: HintPasswordText) {
  return (
    <div className={styles.passwordHintBlock} {...props}>
      <div className={styles.passwordHintContainer} />
      <p className={clsx(styles.text, errors.includes(text) ? '' : styles.textSuccess)}>{text}</p>
    </div>
  )
}
