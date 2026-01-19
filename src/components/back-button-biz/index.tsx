import { useNavigate } from 'react-router-dom'

import { TriangleIcon } from 'icons'

import styles from './styles.module.scss'

type BackButton = {
  backFn?: () => void
  padding?: number
}

export function BackButtonBiz({ backFn, padding = 20 }: BackButton) {
  const navigate = useNavigate()

  const handleBack = () => {
    backFn ? backFn() : navigate(-1)
  }

  return (
    <div onClick={handleBack} className={styles.backBtnWrap} style={{ padding }}>
      <div className={styles.backBtn}>
        <div className={styles.arrowBack} />
        <div className={styles.backText}>Back</div>
      </div>
    </div>
  )
}
