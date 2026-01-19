import { createEffect, createEvent, createStore } from 'effector'

import { OTCPair, OTCParams, OtcService, PageOTCResponse } from 'wip/services/otc'

export const $pageOTC = createStore<PageOTCResponse | null>(null)

export const getOtcFx = createEffect(async (data?: OTCParams) => {
  const otcRes = await OtcService.getAllUserRequests({ page: data?.page || 0, size: data?.size || 1000 })
  return otcRes
})

$pageOTC.on(getOtcFx.doneData, (s, p) => p)

export const $otcIsLoading = createStore(false)
export const setOtcIsLoadingEv = createEvent<boolean>()

$otcIsLoading.on(setOtcIsLoadingEv, (_state, payload) => payload)

export const $pairsOTC = createStore<OTCPair[]>([])

export const getPairsOtcFx = createEffect(async () => {
  const otcPairsRes = await OtcService.getPairs()
  return otcPairsRes
})

$pairsOTC.on(getPairsOtcFx.doneData, (s, p) => p)
