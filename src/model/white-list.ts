import { createEffect, createStore } from 'effector'

import { WhitelistAddressResponse, WhitListServices } from '../wip/services/white-list'

export const $whiteList = createStore<WhitelistAddressResponse[]>([])

export const getWhiteListFx = createEffect(async () => {
  const response = await WhitListServices.getAddressWhitelist()
  return response.content
})

$whiteList.on(getWhiteListFx.doneData, (s, p) => p)
