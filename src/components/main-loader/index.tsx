import { Spinner } from 'components'

import styles from './styles.module.scss'

export function MainLoader() {
  return (
    <div className={styles.spinnerWrap}>
      <Spinner />
    </div>
  )
}
