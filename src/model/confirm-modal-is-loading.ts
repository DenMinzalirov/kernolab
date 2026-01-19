import { createEvent, createStore } from 'effector'

export const $confirmModalIsLoading = createStore(false)

export const setConfirmModalIsLoadingEv = createEvent<boolean>()

$confirmModalIsLoading.on(setConfirmModalIsLoadingEv, (_state, payload) => payload)
