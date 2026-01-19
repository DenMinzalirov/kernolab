import { createEffect, createStore } from 'effector'

import { TierResponse, XanovaServices } from 'wip/services'

const defaultValue: TierResponse = {
  name: '',
  amountNeeded: '',
}

export const $tierXanova = createStore(defaultValue)

export const getTierXanovaFx = createEffect(async () => {
  return await XanovaServices.getCurrentMembershipTier()
})

$tierXanova.on(getTierXanovaFx.doneData, (s, p) => p)
