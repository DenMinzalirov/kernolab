import { createEvent, createStore } from 'effector'

import { localStorageKeys } from 'constant'

const getInitialToken = (): string => {
  return localStorage.getItem(localStorageKeys.token) || ''
}

export const $authToken = createStore<string>(getInitialToken())

export const setAuthTokenEv = createEvent<string>()
export const clearAuthTokenEv = createEvent()

$authToken.on(setAuthTokenEv, (_, token) => token)
$authToken.reset(clearAuthTokenEv)
