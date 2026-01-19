import { createEffect, createStore } from 'effector'

import { AuthServiceV4, UserInfoResponse } from 'wip/services'

const defaultInfo: UserInfoResponse = {
  email: '',
  phone: '',
  referralCode: '',
  appliedReferralCode: '',
}

export const $userInfo = createStore(defaultInfo)

export const getUserInfoFx = createEffect(async () => {
  return await AuthServiceV4.userInfo()
})

$userInfo.on(getUserInfoFx.doneData, (s, p) => p)
