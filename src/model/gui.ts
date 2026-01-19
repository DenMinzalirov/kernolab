import { createEvent, createStore } from 'effector'

export const $isMobile = createStore<boolean>(false)
export const setIsMobileEV = createEvent<boolean>()

export const $isMobileNavOpen = createStore<boolean>(false)
export const setIsMobileNavOpenEV = createEvent<boolean>()

$isMobile.on(setIsMobileEV, (_state, payload) => payload)
$isMobileNavOpen.on(setIsMobileNavOpenEV, (_state, payload) => payload)
