import { createEffect, createStore } from 'effector'

import { TierResponse, XanovaServices } from 'wip/services'

const defaultValue: TierResponse[] = []

export const $tiersXanova = createStore(defaultValue)

export const getTiersXanovaFx = createEffect(async () => {
  return await XanovaServices.getMembershipTiers()
})

$tiersXanova.on(getTiersXanovaFx.doneData, (s, p) => p)
