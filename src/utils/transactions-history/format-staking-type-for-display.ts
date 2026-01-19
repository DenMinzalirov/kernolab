import { StakingType } from 'wip/services/transactions-new'

export const formatStakingTypeForDisplay = (value: StakingType) => {
  switch (value) {
    case StakingType.STAKING_CAMPAIGN:
      return 'Supercharge Staking'

    case StakingType.STAKING_ROLLING_LEVELED:
      return 'PAIRS Staking'

    // TODO change Pairs ??
    case StakingType.STAKING_SIMPLE:
      return 'PAIRS Earn Staking'

    default:
      return value
  }
}
