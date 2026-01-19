import { createEffect, createEvent, createStore } from 'effector'

import { OTCTradeServices } from '../../wip/services/fideumOTC-services/OTC-trade'

const temp = ['lp-1', 'lp-2']

export const $lpOTC = createStore<string[]>([])
export const $lpOTCChangedEv = createEvent<[]>()

export const lpOTCDataFx = createEffect(async () => {
  return await OTCTradeServices.getLiquidityProviders()
})

$lpOTC.on(lpOTCDataFx.doneData, (_, repos) => repos).on($lpOTCChangedEv, (s, p) => p)
