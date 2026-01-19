import { HTMLAttributes } from 'react'

import { NavPanelFideumOTC } from './nav-panel-fideumOTC'
import styles from './styles.module.scss'

export function MainFideumOTC({ children }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={styles.main}>
      <>
        <NavPanelFideumOTC />
        <div className={styles.headerSpacer} />
        {children}
      </>
    </div>
  )
}
