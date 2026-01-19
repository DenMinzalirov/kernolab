import { OperationType } from 'wip/services/transactions-new'

import { TITLE_TXN_HISTORY_NEW } from '../constants'

export const getTitle = (value: string) => {
  switch (value) {
    case 'Staking Reward':
      return TITLE_TXN_HISTORY_NEW.STAKING_REWARD

    case 'Staking Claimed':
      return TITLE_TXN_HISTORY_NEW.STAKING_REWARD

    case 'Staking Campaign Claimed':
      return TITLE_TXN_HISTORY_NEW.STAKING_REWARD

    case 'Referral Bonus':
      return TITLE_TXN_HISTORY_NEW.REFERRAL_BONUS

    case 'Cash Back':
      return TITLE_TXN_HISTORY_NEW.CASHBACK

    case OperationType.CRYPTO_DEPOSIT:
      return TITLE_TXN_HISTORY_NEW.DEPOSIT

    case OperationType.CRYPTO_WITHDRAW:
      return TITLE_TXN_HISTORY_NEW.WITHDRAWAL

    case OperationType.FIAT_DEPOSIT:
      return TITLE_TXN_HISTORY_NEW.TOP_UP

    case OperationType.FIAT_WITHDRAW:
      return TITLE_TXN_HISTORY_NEW.WITHDRAWAL

    case OperationType.EXCHANGE:
      return TITLE_TXN_HISTORY_NEW.EXCHANGE

    case OperationType.REWARD:
      return TITLE_TXN_HISTORY_NEW.REWARD

    case OperationType.LAUNCHPAD_STAKE_ALLOCATION:
      return TITLE_TXN_HISTORY_NEW.STAKE_ALLOCATION

    case OperationType.LAUNCHPAD_CLAIM_REFUND:
      return TITLE_TXN_HISTORY_NEW.REFUND_CLAIM

    case OperationType.LAUNCHPAD_CLAIM_TOKEN:
      return TITLE_TXN_HISTORY_NEW.TOKEN_CLAIM

    case OperationType.STAKING_CAMPAIGN_CREATE:
      return TITLE_TXN_HISTORY_NEW.SUPERCHARGE_STAKED

    case OperationType.STAKING_CAMPAIGN_CLOSE:
      return TITLE_TXN_HISTORY_NEW.SUPERCHARGE_CLAIMED

    case OperationType.STAKING_REWARD:
      return TITLE_TXN_HISTORY_NEW.STAKING_REWARD

    case OperationType.STAKING_ROLLING_CREATE:
    case OperationType.STAKING_ROLLING_LEVELED_CREATE:
      return TITLE_TXN_HISTORY_NEW.FI_STAKED

    case OperationType.STAKING_ROLLING_CLOSE:
    case OperationType.STAKING_ROLLING_LEVELED_CLOSE:
      return TITLE_TXN_HISTORY_NEW.FI_CLAIMED

    case OperationType.STAKING_SIMPLE_CREATE:
      return TITLE_TXN_HISTORY_NEW.FIDEUM_EARN_STAKED

    case OperationType.STAKING_SIMPLE_CLOSE:
      return TITLE_TXN_HISTORY_NEW.FIDEUM_EARN_CLAIMED

    default:
      return value
  }
}
