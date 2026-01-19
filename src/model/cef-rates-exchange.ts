import { createEffect, createStore } from 'effector'

import { AssetsServices, ExchangeRate } from '../wip/services'

export const $assetsCefiExchangeRates = createStore<ExchangeRate[]>([])

export const assetsCefiExchangeRatesFx = createEffect(async () => {
  const rates = await AssetsServices.getRatesList()

  return rates.filter(rateItem => {
    if (rateItem.toAssetId === 'USD') return false
    return rateItem.fromAssetId !== 'USD'
  })
})

$assetsCefiExchangeRates.on(assetsCefiExchangeRatesFx.doneData, (_, repos) => repos)
