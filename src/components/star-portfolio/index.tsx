import { useState } from 'react'

import { AssetsServices } from 'wip/services'
import { initApp } from 'wip/stores'
import { StarIcon } from 'icons'
import { StarBizIcon } from 'icons/star-biz'
import { isBiz } from 'config'
import { CombinedObject } from 'model/cefi-combain-assets-data'

import styles from './styles.module.scss'

export interface Star {
  asset: CombinedObject
}

export function Star({ asset }: Star) {
  const [isLoading, setIsLoading] = useState(false)
  const updateFavourite = async (assetItem: CombinedObject): Promise<void> => {
    setIsLoading(true)
    try {
      await AssetsServices.setFavouriteAssetAddRemove({
        assetId: assetItem.assetId,
        isFavorite: !assetItem.isFavourite,
      })
      await initApp()
    } catch (e) {
      console.log('ERROR-setFavouriteAssetAddRemove', e)
    }

    setIsLoading(false)
  }

  return (
    <div
      className={styles.starContainer}
      onClick={async event => {
        event.stopPropagation()
        await updateFavourite(asset)
      }}
    >
      {isLoading && (
        <div style={{ position: 'absolute', left: isBiz ? 10 : 12, top: 11 }}>
          <span className='spinner-border' />
        </div>
      )}

      {isBiz ? (
        <StarBizIcon
          fill={asset.isFavourite ? '#FCAB0C' : 'none'}
          stroke={asset.isFavourite ? '#FCAB0C' : 'var(--Dark-Grey)'}
        />
      ) : (
        <StarIcon
          fill={asset.isFavourite ? 'var(--P-System-Yellow)' : 'var(--White)'}
          stroke={asset.isFavourite ? 'var(--P-System-Yellow)' : 'var(--Deep-Space-10)'}
        />
      )}
    </div>
  )
}
