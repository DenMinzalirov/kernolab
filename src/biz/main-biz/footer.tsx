import { getFooterTitle } from '../../config'
import styles from './styles.module.scss'

export function Footer() {
  const footerTitle = getFooterTitle()

  return (
    <footer className={styles.footer}>
      <p className={styles.footerText}>{footerTitle || '2024 @ Fideum | Fideum Group. All rights reserved.'}</p>
    </footer>
  )
}
