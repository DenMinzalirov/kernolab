import { createEffect, createStore } from 'effector'

import { AuthServiceV4, MembershipStatusResponse, UserInfoResponse, XanovaServices } from 'wip/services'

const defaultValue: MembershipStatusResponse = {
  userUuid: '',
  invitedBy: '',
  isActive: false,
  availableCommissions: '',
  totalCommissionsEarned: '',
  lifetimeSales: '',
  createdAt: '',
  updatedAt: '',
}

export const $membershipStatus = createStore(defaultValue)

export const getMembershipStatusFx = createEffect(async () => {
  return await XanovaServices.getMembershipStatus()
})

$membershipStatus.on(getMembershipStatusFx.doneData, (s, p) => p)
