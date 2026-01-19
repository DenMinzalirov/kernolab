import { combine } from 'effector'

import { assetCoingeckoId } from '../constant/assetCoingeckoId'
import AssetsIcons from '../constant/assetsIcon'
import { AssetInfo, ExchangeRateRaw, NetworkWithAssetInfo, UserAsset } from '../wip/services'
import { $assetsRates } from './cef-rates-coingecko'
import { $assets } from './cefi-assets-list'
import { $cefiCryptoDepositWithdrawAssets } from './cefi-crypto-deposit-withdraw-assets'
import { $myAssets } from './cefi-my-assets-list'
import { $favouriteAssets } from './favourite-assets'

export interface CombinedObject extends AssetInfo, UserAsset {
  icon: string
  eur: {
    cash: number
    price: number
    priceChangePercentage24h: string
  }
  usd: {
    cash: number
    price: number
    priceChangePercentage24h: string
  }
  coinGeckoId: string
  assetId: string
  isFavourite?: boolean

  networksInfo: NetworkWithAssetInfo[]
}

export const $assetsListData = combine(
  [$assets, $cefiCryptoDepositWithdrawAssets, $myAssets, $assetsRates, $favouriteAssets],
  ([assets, cefiCryptoDepositWithdrawAssets, myAssets, assetsRates, favouriteAssets]) => {
    const result: CombinedObject[] = []

    // Объединяем данные из трех сторов
    assets.forEach(asset => {
      const assetId = asset.assetId

      if (assetId === 'EUR') return
      if (assetId === 'USD') return

      const myAsset = myAssets.find(myAsset => myAsset.assetId === assetId) || ({} as UserAsset)

      const assetRateUSD =
        assetsRates.find(rate => rate.fromAssetId === assetId && rate.toAssetId === 'USD') || ({} as ExchangeRateRaw)
      const assetRateEUR =
        assetsRates.find(rate => rate.fromAssetId === assetId && rate.toAssetId === 'EUR') || ({} as ExchangeRateRaw)

      const usdRate = assetRateUSD?.data || null

      const availableCashUsd = Number(myAsset?.availableBalance || 0) * (usdRate ? usdRate.currentPrice : 0)

      const eurRate = assetRateEUR?.data || null

      const availableCashEur = Number(myAsset?.availableBalance || 0) * (eurRate ? eurRate.currentPrice : 0)

      const symbolPriceChangePercentage = (rate: string) => (Number(rate) > 0 ? '+' : '')

      const networksInfo =
        cefiCryptoDepositWithdrawAssets.find(info => info.assetId === assetId)?.networks ||
        ([] as NetworkWithAssetInfo[])

      const combinedObject = {
        ...asset,
        ...myAsset,
        networksInfo,
        availableBalance: myAsset?.availableBalance || 0,
        icon:
          usdRate?.image ||
          eurRate?.image ||
          AssetsIcons[asset.symbol?.toLowerCase()] ||
          require('../assets/images/crypto-icons/unknown.png'),
        eur: {
          cash: availableCashEur,
          price: eurRate?.currentPrice || 0,
          priceChangePercentage24h: `${symbolPriceChangePercentage(
            eurRate?.priceChangePercentage24h?.toString() || '0'
          )}${Number(eurRate?.priceChangePercentage24h || 0).toFixed(2)}`,
        },
        usd: {
          cash: availableCashUsd,
          price: usdRate?.currentPrice || 0,
          priceChangePercentage24h: `${symbolPriceChangePercentage(
            usdRate?.priceChangePercentage24h?.toString() || '0'
          )}${Number(usdRate?.priceChangePercentage24h || 0).toFixed(2)}`,
        },
        coinGeckoId: usdRate?.id || eurRate?.id || assetCoingeckoId[asset.symbol],
        isFavourite: favouriteAssets.includes(asset.assetId),
      }

      result.push(<CombinedObject>combinedObject)
    })
    return result
  }
)

//EUR FIAT
export const $assetEurData = combine([$assets, $myAssets, $assetsRates], ([assets, myAssets, assetsRates]) => {
  const eurToUsdData = assetsRates.find(rate => rate.toAssetId === 'EUR' && rate.fromAssetId === 'USDT')
  const currentPriceUsd = 1 / Number(eurToUsdData?.data?.currentPrice || 0.925)

  const eurAsset = assets.find(asset => asset.assetId === 'EUR') || ({} as AssetInfo)
  const eurMyAsset = myAssets.find(asset => asset.assetId === 'EUR') || ({} as UserAsset)

  const combinedObject = {
    ...eurAsset,
    ...eurMyAsset,
    icon: AssetsIcons.eur || require('../assets/images/crypto-icons/unknown.png'),
    availableBalance: eurMyAsset?.availableBalance || 0,
    eur: {
      cash: eurMyAsset?.availableBalance || 0,
      price: 1,
      priceChangePercentage24h: `${(0).toFixed(2)}`,
    },
    usd: {
      cash: Number(eurMyAsset?.availableBalance || 0) * currentPriceUsd,
      price: currentPriceUsd || 1.1,
      priceChangePercentage24h: `${(0).toFixed(2)}`,
    },
  }

  return combinedObject as CombinedObject
})

//USD FIAT
const currentPrice = 1.075
//TODO разобраться с currentPriceEur
export const $assetUsdData = combine([$assets, $myAssets, $assetsRates], ([assets, myAssets, assetsRates]) => {
  // const eurToUsdData = assetsRates.find(rate => rate.toAssetId === 'EUR' && rate.fromAssetId === 'USDT')
  const currentPriceEur = 1 / currentPrice //TODO дороботать курсс

  const usdAsset = assets.find(asset => asset.assetId === 'USD') || ({} as AssetInfo)
  const usdMyAsset = myAssets.find(asset => asset.assetId === 'USD') || ({} as UserAsset)

  const combinedObject = {
    ...usdAsset,
    ...usdMyAsset,
    icon: AssetsIcons.usd || require('../assets/images/crypto-icons/unknown.png'),
    availableBalance: usdMyAsset?.availableBalance || 0,
    eur: {
      cash: Number(usdMyAsset?.availableBalance || 0) * currentPriceEur,
      price: 1,
      priceChangePercentage24h: `${(0).toFixed(2)}`,
    },
    usd: {
      cash: usdMyAsset?.availableBalance || 0,
      price: 999,
      priceChangePercentage24h: `${(0).toFixed(2)}`,
    },
  }

  return combinedObject as CombinedObject
})
