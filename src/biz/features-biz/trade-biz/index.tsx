import { useLocation } from 'react-router-dom'

import { TradeAssetModal } from '../../../features/modals'
import styles from './styles.module.scss'

export function TradeBiz() {
  const location = useLocation()
  const asset = location.state?.asset

  return (
    <div className={styles.container}>
      <div className={styles.contentWrap}>
        <TradeAssetModal asset={asset} />
      </div>
    </div>
  )
}
