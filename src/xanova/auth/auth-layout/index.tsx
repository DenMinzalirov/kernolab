import type { CSSProperties } from 'react'

import authXanovaImage from 'assets/images/auth_xenova.avif'

import styles from './styles.module.scss'

type Props = {
  children: React.ReactNode
}

export function AuthLayoutXanova({ children }: Props) {
  return (
    <div className={styles.page} style={{ '--auth-layout-bg': `url(${authXanovaImage})` } as CSSProperties}>
      <aside className={styles.imageSection}>
        <img src={authXanovaImage} alt='auth image' className={styles.image} />
        <div className={styles.imageContent}>
          <h1 className={styles.imageTextTitle}>Xanova</h1>
          <div className={styles.imageBottomSlot}>
            <p className={styles.imageTextTitle}>
              Protect. Grow.
              <br /> Earn Together.
            </p>
            <p className={styles.imageTextSubTitle}>
              With Xanova membership you unlock insurance, trading, and advisory tools — all in one place.
              <br /> Track your earnings, build your network, and&nbsp;secure&nbsp;your financial future with us.
            </p>
          </div>
        </div>
      </aside>

      <div className={styles.tabletAndDown}>
        <h1 className={styles.imageTextTitle}>Xanova</h1>
      </div>

      <main className={styles.contentSection}>
        <div className={styles.contentInner}>{children}</div>
      </main>
    </div>
  )
}
