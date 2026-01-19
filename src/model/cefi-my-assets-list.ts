import { createEffect, createEvent, createStore } from 'effector'

import { AssetsServices, UserAsset } from '../wip/services'

export const $myAssets = createStore<UserAsset[]>([])
export const myAssetsChangedEv = createEvent<[]>()
export const myAssetsFx = createEffect(async () => {
  return await AssetsServices.getMyAssets()
})

$myAssets.on(myAssetsFx.doneData, (_, repos) => repos).on(myAssetsChangedEv, (s, p) => p)
