import { createEffect, createStore } from 'effector'

import { AuthServiceV4 } from 'wip/services'

export const $unstoppableDomains = createStore<any>({})

export const getUnstoppableDomainsFx = createEffect(async () => {
  // try {
  //     const { email } = await AuthServiceV4.getEmail()
  //     return email
  // } catch (error) {
  //     console.log('ERROR-getCardStatusFx', error)
  // }
})

$unstoppableDomains.on(getUnstoppableDomainsFx.doneData, (s, p) => p)
