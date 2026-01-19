import { useLocation } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { HeaderTitle } from '../../components'
import { $assetsListData } from '../../model/cefi-combain-assets-data'
import { WithdrawAssetModal } from '../modals'
import styles from './styles.module.scss'

export function WithdrawalAssets() {
  const location = useLocation()
  const asset = location.state?.asset

  const assets = useUnit($assetsListData)

  return (
    <div className='page-container-pairs'>
      <HeaderTitle headerTitle={asset?.assetName} showBackBtn backBtnTitle={'Portfolio'} />
      <div className={styles.contentWrap}>
        <WithdrawAssetModal asset={asset || assets[0]} />
      </div>
    </div>
  )
}
