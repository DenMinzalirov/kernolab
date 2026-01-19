import { createEffect, createEvent, createStore } from 'effector'

import { B2C2CombinedInstrumentResponse, OTCTradeServices } from '../../wip/services/fideumOTC-services/OTC-trade'

export const $instrumentsOTC = createStore<B2C2CombinedInstrumentResponse[]>([])
export const $instrumentsOTCChangedEv = createEvent<[]>()

export const instrumentsOTCDataFx = createEffect(async () => {
  return await OTCTradeServices.getB2C2Instruments()
})

$instrumentsOTC.on(instrumentsOTCDataFx.doneData, (_, repos) => repos).on($instrumentsOTCChangedEv, (s, p) => p)
