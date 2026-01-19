import { CheckedIcon } from 'icons'

import styles from './styles.module.scss'

export function Copied() {
  return (
    <div className={styles.copiedWrap}>
      <div style={{ marginRight: 6 }}>Address Copied</div>
      <CheckedIcon />
    </div>
  )
}
