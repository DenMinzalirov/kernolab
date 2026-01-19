import React from 'react'

import { Modal } from '../../../../components'
import { CombinedObject } from '../../../../model/cefi-combain-assets-data'
import styles from './styles.module.scss'

type Props = {
  assetsList: CombinedObject[]
  setSelectedData: any
}

export function SelectAssetMobileBiz({ assetsList, setSelectedData }: Props): React.ReactNode {
  const handleAsset = (asset: CombinedObject) => {
    setSelectedData(asset)
    Modal.close()
  }

  return (
    <div className={styles.containerModal}>
      <div className={styles.contentWrapModal}>
        <div className={styles.title}>Select an Asset</div>
        <div className={styles.assetsContainer}>
          {assetsList.map(asset => {
            return (
              <div onClick={() => handleAsset(asset)} className={styles.row} key={asset.assetName}>
                <img alt={''} src={asset.icon} style={{ height: 24, width: 24 }} className='asset-icon' />
                <div className={styles.assetId}>{asset.assetId}</div>
                {' - '}
                <div className={styles.assetName}>{asset.assetName}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
