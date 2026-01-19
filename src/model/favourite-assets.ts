import { createEffect, createStore } from 'effector'

import { AssetsServices } from '../wip/services'

export const $favouriteAssets = createStore<string[]>([])

export const getFavouriteAssetsFx = createEffect(async () => {
  return await AssetsServices.getFavouriteAssets()
})

$favouriteAssets.on(getFavouriteAssetsFx.doneData, (s, p) => p)
