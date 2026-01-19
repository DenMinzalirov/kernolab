import { OperationType } from 'wip/services/transactions-new'
import arrowDownPrimaryIconSvg from 'assets/icons/history/arrow-down-primary-icon.svg'
import depositIconSvg from 'assets/icons/history/deposit-icon.svg'
import earningClaimedIconSvg from 'assets/icons/history/earning-claimed-icon.svg'
import earningRewardIconSvg from 'assets/icons/history/earning-reward-icon.svg'
import exchangeIconSvg from 'assets/icons/history/exchange-icon.svg'
import withdrawalIconSvg from 'assets/icons/history/withdrawal-icon.svg'

export const getLocalIcon = (value: string) => {
  switch (value) {
    case 'Staking Reward':
    case 'Referral Bonus':
    case 'Cash Back':
    case 'Staking Campaign Claimed':
    case OperationType.REWARD:
      return earningRewardIconSvg

    case OperationType.STAKING_CAMPAIGN_CREATE:
    case OperationType.STAKING_POS_CREATE:
    case OperationType.STAKING_ROLLING_CREATE:
    case OperationType.STAKING_ROLLING_LEVELED_CREATE:
    case OperationType.STAKING_SIMPLE_CREATE:
      return arrowDownPrimaryIconSvg

    case 'Staking Claimed':
    case OperationType.STAKING_CAMPAIGN_CLOSE:
    case OperationType.STAKING_POS_CLOSE:
    case OperationType.STAKING_ROLLING_CLOSE:
    case OperationType.STAKING_ROLLING_LEVELED_CLOSE:
    case OperationType.STAKING_SIMPLE_CLOSE:
      return earningClaimedIconSvg

    case OperationType.CRYPTO_DEPOSIT:
    case OperationType.FIAT_DEPOSIT:
    case OperationType.LAUNCHPAD_CLAIM_REFUND:
    case OperationType.LAUNCHPAD_CLAIM_TOKEN:
      return depositIconSvg

    case OperationType.CRYPTO_WITHDRAW:
    case OperationType.FIAT_WITHDRAW:
    case OperationType.LAUNCHPAD_STAKE_ALLOCATION:
      return withdrawalIconSvg

    case OperationType.EXCHANGE:
      return exchangeIconSvg

    default:
      return earningRewardIconSvg
  }
}
