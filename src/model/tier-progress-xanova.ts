import { combine } from 'effector'

import { $membershipStatus, getMembershipStatusFx } from './membership-status'
import { $tierXanova, getTierXanovaFx } from './tier-xanova'
import { $tiersXanova, getTiersXanovaFx } from './tiers-xanova'

export const $tierProgressXanova = combine(
  { tiers: $tiersXanova, current: $tierXanova, membership: $membershipStatus },
  ({ tiers, current, membership }) => ({
    tiers,
    currentTier: {
      name: current.name,
      earnedAmount: membership.lifetimeSales,
    },
  })
)

export const $tierProgressXanovaLoading = combine(
  [getTiersXanovaFx.pending, getTierXanovaFx.pending, getMembershipStatusFx.pending],
  statuses => statuses.some(Boolean)
)
