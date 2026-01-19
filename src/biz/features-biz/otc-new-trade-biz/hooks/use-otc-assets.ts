import { useEffect, useState } from 'react'
import { useUnit } from 'effector-react'

import { OTCPair } from 'wip/services/otc'
import { $assetEurData, $assetsListData, CombinedObject } from 'model/cefi-combain-assets-data'
import { $pairsOTC } from 'model/otc'

import { FromAndToAsset } from '../typeAndConstant'

const getUniqueAssets = (combinedAssets: CombinedObject[], otcPairs: OTCPair[]) => {
  const fromAssetsMap = new Map<string, FromAndToAsset>()
  const toAssetsMap = new Map<string, FromAndToAsset>()

  otcPairs.forEach(pair => {
    const fromAsset = combinedAssets.find(asset => asset.assetId === pair.fromAssetId)
    const toAsset = combinedAssets.find(asset => asset.assetId === pair.toAssetId)

    if (fromAsset) {
      fromAssetsMap.set(fromAsset.assetId, {
        assetId: fromAsset.assetId,
        icon: fromAsset.icon,
        minimalAmount: pair.minimalAmount,
        availableBalance: fromAsset.availableBalance.toString(),
      })
    }

    if (toAsset) {
      toAssetsMap.set(toAsset.assetId, {
        assetId: toAsset.assetId,
        icon: toAsset.icon,
        minimalAmount: pair.minimalAmount,
        availableBalance: toAsset.availableBalance.toString(),
      })
    }
  })

  return {
    fromAssets: Array.from(fromAssetsMap.values()),
    toAssets: Array.from(toAssetsMap.values()),
  }
}

export const useOtcAssets = (watchFromAsset: FromAndToAsset | null, watchToAsset: FromAndToAsset | null) => {
  const pairsOTC = useUnit($pairsOTC)
  const assets = useUnit($assetsListData)
  const assetEurData = useUnit($assetEurData)
  const allAssets: CombinedObject[] = [...assets, assetEurData] as CombinedObject[]

  const [fromAssetsState, setFromAssetsState] = useState<FromAndToAsset[]>([])
  const [toAssetsState, setToAssetsState] = useState<FromAndToAsset[]>([])
  const [minAmount, setMinAmount] = useState('')

  useEffect(() => {
    if (watchFromAsset && watchToAsset) {
      const pair = pairsOTC.find(
        item => item.fromAssetId === watchFromAsset.assetId && item.toAssetId === watchToAsset.assetId
      )
      setMinAmount(pair?.minimalAmount ? pair.minimalAmount.toString() : '')
    } else {
      setMinAmount('')
    }
  }, [watchFromAsset, watchToAsset, pairsOTC])

  useEffect(() => {
    if (watchToAsset) {
      const filteredPairs = pairsOTC.filter(asset => asset.toAssetId === watchToAsset.assetId)
      const data = getUniqueAssets(allAssets, filteredPairs)
      setFromAssetsState(data.fromAssets)
    } else {
      const data = getUniqueAssets(allAssets, pairsOTC)
      setFromAssetsState(data.fromAssets)
    }

    if (watchFromAsset) {
      const filteredPairs = pairsOTC.filter(asset => asset.fromAssetId === watchFromAsset.assetId)
      const data = getUniqueAssets(allAssets, filteredPairs)
      setToAssetsState(data.toAssets)
    } else {
      const data = getUniqueAssets(allAssets, pairsOTC)
      setToAssetsState(data.toAssets)
    }
  }, [watchFromAsset, watchToAsset, pairsOTC, assets, assetEurData])

  return { fromAssetsState, toAssetsState, minAmount }
}
