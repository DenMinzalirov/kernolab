import { useLocation } from 'react-router-dom'

import { HeaderTitle } from 'components'

import { TradeAssetModal } from '../modals'
import styles from './styles.module.scss'

export function TradeAssets() {
  const location = useLocation()
  const asset = location.state?.asset

  return (
    <div className='page-container-pairs'>
      <HeaderTitle headerTitle={asset.assetName} showBackBtn backBtnTitle={'Portfolio'} />
      <div className={styles.contentWrap}>
        <TradeAssetModal asset={asset} />
      </div>
    </div>
  )
}
