import { useEffect, useState } from 'react'
import { useUnit } from 'effector-react'

import { EVENT_NAMES, useAnalytics } from 'wip/services'
import { isBiz } from 'config'
import { $assetsListData, CombinedObject } from 'model/cefi-combain-assets-data'

import { Buy } from './buy'
import { Exchange } from './exchange'
import { NavBlock } from './nav-block'
import { Sell } from './sell'
import styles from './styles.module.scss'

export interface TradeAssetModal {
  asset?: CombinedObject
}

export function TradeAssetModal({ asset }: TradeAssetModal) {
  const assets = useUnit($assetsListData)

  const randomAsset = assets.find(assetItem => {
    return assetItem.assetId === 'USDT'
  })

  const [assetItem] = useState<CombinedObject>(asset || randomAsset || assets[0])

  const { myLogEvent } = useAnalytics()

  const [activePanel, setActivePanel] = useState('Exchange')

  const [isSuccessfully, setIsSuccessfully] = useState('')

  const [showNavBlock, setShowNavBlock] = useState(true)

  useEffect(() => {
    myLogEvent(EVENT_NAMES.WEB_TRADE_OPENED, { asset: asset?.assetId })
  }, [])

  return (
    <div className={isBiz ? styles.mainBiz : isSuccessfully ? styles.mainSuccess : styles.main}>
      {!isBiz && isSuccessfully !== activePanel && showNavBlock ? (
        <NavBlock asset={assetItem} setActivePanel={setActivePanel} activePanel={activePanel} />
      ) : null}

      <div style={isBiz ? { display: 'flex', flexGrow: 1, flexDirection: 'column' } : {}}>
        {activePanel === 'Exchange' && (
          <Exchange
            asset={assetItem}
            isSuccessfully={isSuccessfully}
            setIsSuccessfully={setIsSuccessfully}
            setShowNavBlock={setShowNavBlock}
          />
        )}
        {activePanel === 'Buy' && (
          <Buy
            asset={assetItem}
            isSuccessfully={isSuccessfully}
            setIsSuccessfully={setIsSuccessfully}
            setShowNavBlock={setShowNavBlock}
          />
        )}
        {activePanel === 'Sell' && (
          <Sell
            asset={assetItem}
            isSuccessfully={isSuccessfully}
            setIsSuccessfully={setIsSuccessfully}
            setShowNavBlock={setShowNavBlock}
          />
        )}
      </div>
    </div>
  )
}
