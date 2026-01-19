import { useUnit } from 'effector-react'

import { CompleteIconBlur } from 'components'
import { $isMobile } from 'model'

import styles from './styles.module.scss'

export function Success() {
  const isMobile = useUnit($isMobile)
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
      }}
    >
      <CompleteIconBlur isMobile={isMobile} />
      <div style={{ height: 50 }} />
      <div className={styles.completedText}>Exchange Successfully Completed</div>
    </div>
  )
}
