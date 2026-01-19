import { createEffect, createEvent, createStore } from 'effector'

import { AssetInfo, AssetsServices } from '../wip/services'

export const $assets = createStore<AssetInfo[]>([])
export const assetsChangedEv = createEvent<[]>()
export const assetsDataFx = createEffect(async () => {
  return await AssetsServices.getAssetsInfo()
})

$assets.on(assetsDataFx.doneData, (_, repos) => repos).on(assetsChangedEv, (s, p) => p)
