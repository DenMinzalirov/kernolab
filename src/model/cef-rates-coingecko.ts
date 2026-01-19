import { createEffect, createStore } from 'effector'

import { AssetsServices, ExchangeRateRaw } from '../wip/services'

export const $assetsRates = createStore<ExchangeRateRaw[]>([])

export const assetsRatesFx = createEffect(async () => {
  return await AssetsServices.getAssetsRatesUsdEur()
})

$assetsRates.on(assetsRatesFx.doneData, (_, repos) => repos)
