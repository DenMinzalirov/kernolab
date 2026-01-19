import { useNavigate } from 'react-router-dom'

import { TriangleIcon } from 'icons'

import styles from './styles.module.scss'

type BackButton = {
  backFn?: () => void
}

export function BackButton({ backFn }: BackButton) {
  const navigate = useNavigate()

  const handleBack = () => {
    backFn ? backFn() : navigate(-1)
  }

  return (
    <div onClick={handleBack} className={styles.backBtn}>
      <div className={styles.btnIcon}>
        <TriangleIcon fill='var(--Deep-Space)' />
      </div>
      <p className={styles.btnText}>Back</p>
    </div>
  )
}
