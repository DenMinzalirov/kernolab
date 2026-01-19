import { createEffect, createEvent, createStore } from 'effector'

import { AuthServiceV4, StepUpBlockExpirationResponse } from 'wip/services'

export const $stepUpBlockExpiration = createStore<StepUpBlockExpirationResponse | null>(null)

export const stepUpBlockExpirationChangedEv = createEvent<StepUpBlockExpirationResponse | null>()

let inFlightRequest: Promise<StepUpBlockExpirationResponse> | null = null
let lastFetchedAt: number | null = null
const STEP_UP_BLOCK_CACHE_TTL = 10 * 1000

export const stepUpBlockExpirationFx = createEffect(async () => {
  const currentBlockExpiration = $stepUpBlockExpiration.getState()
  const now = Date.now()

  if (currentBlockExpiration && lastFetchedAt && now - lastFetchedAt <= STEP_UP_BLOCK_CACHE_TTL) {
    return currentBlockExpiration
  }

  if (!inFlightRequest) {
    inFlightRequest = AuthServiceV4.getStepUpBlockExpiration()
      .then(response => {
        lastFetchedAt = Date.now()
        return response
      })
      .finally(() => {
        inFlightRequest = null
      })
  }

  return await inFlightRequest
})

$stepUpBlockExpiration
  .on(stepUpBlockExpirationFx.doneData, (_, repos) => repos)
  .on(stepUpBlockExpirationChangedEv, (s, p) => p)
