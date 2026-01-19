import { createEvent, createStore } from 'effector'

import { getToken, parseJwt } from 'utils'

const token = getToken()
const parsedToken = parseJwt(token || '')
const scope = parsedToken?.scope || []

export const $twoFaStatus = createStore<boolean>(scope.includes('MFA'))
export const setTwoFaStatusEv = createEvent<boolean>()

$twoFaStatus.on(setTwoFaStatusEv, (_state, payload) => payload)

// $twoFaStatus.watch(state => console.log('@state', state)) TODO подумать над синхронизацией токина из локал стора
