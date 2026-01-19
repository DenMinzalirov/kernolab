import { Dispatch, SetStateAction } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { isBiz } from '../../../config'
import { $assetsCefiExchangeRates } from '../../../model/cef-rates-exchange'
import { CombinedObject } from '../../../model/cefi-combain-assets-data'
import styles from './styles.module.scss'

const navItems = [{ name: 'Exchange' }, { name: 'Buy' }, { name: 'Sell' }]

type Props = {
  asset: CombinedObject
  setActivePanel: Dispatch<SetStateAction<string>>
  activePanel: string
}

export function NavBlock({ asset, setActivePanel, activePanel }: Props) {
  const ratesCeFi = useUnit($assetsCefiExchangeRates)

  const eurAssetRate = ratesCeFi.find(rate => rate.fromAssetId === 'EUR' && rate.toAssetId === asset?.assetId)
  const assetRateToEUR = ratesCeFi.find(
    assetRaw => assetRaw.toAssetId === 'EUR' && assetRaw.fromAssetId === asset?.assetId
  )

  return (
    <div className={isBiz ? styles.navBlockBiz : styles.navBlock}>
      {navItems.map(navItem => {
        if (isBiz) {
          const isInactive = (!eurAssetRate && navItem.name === 'Buy') || (!assetRateToEUR && navItem.name === 'Sell')
          return (
            <div
              key={navItem.name}
              onClick={() => setActivePanel(navItem.name)}
              className={clsx(styles.navItemBiz, {
                [styles.navItemActiveBiz]: activePanel === navItem.name,
                [styles.navItemInActiveBiz]: isInactive,
              })}
            >
              {navItem.name}
            </div>
          )
        }

        if (!eurAssetRate && navItem.name === 'Buy') return null
        if (!assetRateToEUR && navItem.name === 'Sell') return null
        return (
          <div
            key={navItem.name}
            onClick={() => setActivePanel(navItem.name)}
            className={clsx(styles.navItem, activePanel === navItem.name ? styles.navItemActive : '')}
          >
            {navItem.name}
          </div>
        )
      })}
    </div>
  )
}
