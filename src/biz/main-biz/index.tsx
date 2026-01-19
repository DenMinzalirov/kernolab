import { HTMLAttributes } from 'react'

import { theme } from '../../config'
import { Footer } from './footer'
import { NavPanelBiz } from './nav-panel-biz'
import styles from './styles.module.scss'

export function MainBiz({ children }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={styles.main}>
      <>
        <NavPanelBiz />
        <div className={styles.headerSpacer} />
        {children}
        <Footer />
      </>
    </div>
  )
}
