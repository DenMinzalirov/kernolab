import { HTMLAttributes } from 'react'

import { NavPanelXanova } from './nav-panel'
import styles from './styles.module.scss'

export function MainXanova({ children }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={styles.bgGradient}>
      <div className={styles.main}>
        <NavPanelXanova />
        {children}
      </div>
    </div>
  )
}
