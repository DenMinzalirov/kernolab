import { useNavigate } from 'react-router-dom'

import { Modal } from 'components'

import styles from './styles.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

type Props = {
  value: string
}

export function Card3DPasswordModal({ value }: Props) {
  const navigate = useNavigate()
  const { isMobilePairs } = useCurrentBreakpointPairs()

  const handleOnClick = async () => {
    navigate(-1)
    Modal.close()
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>Your 3DS Password</div>

      <div className={styles.valueWrap}>
        <span className={styles.value}>{value}</span>
      </div>

      <div>
        <button type='button' className={`btn-new primary ${isMobilePairs ? 'big' : ''}`} onClick={handleOnClick}>
          Close
        </button>
      </div>
    </div>
  )
}
