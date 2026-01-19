import { createEvent, createStore } from 'effector'

export const DEFAULT_STEP = 'INIT'

export const setStepControllerNextStepEV = createEvent<string | null | undefined>()
export const resetStepControllerNextStepEV = createEvent()

export const $stepControllerNextStep = createStore<string>(DEFAULT_STEP)
  .on(setStepControllerNextStepEV, (_state, nextStep) => (nextStep ? nextStep : DEFAULT_STEP))
  .reset(resetStepControllerNextStepEV)
