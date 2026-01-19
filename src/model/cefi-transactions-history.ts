import { createEffect, createStore } from 'effector'

import { TYPE_TXN_HISTORY } from 'features/transactions-history/constants'
import { TransactionsServices } from 'wip/services'
import depositIconSvg from 'assets/icons/history/deposit-icon.svg'
import earningClaimedIconSvg from 'assets/icons/history/earning-claimed-icon.svg'
import earningRewardIconSvg from 'assets/icons/history/earning-reward-icon.svg'
import exchangeIconSvg from 'assets/icons/history/exchange-icon.svg'
import withdrawalIconSvg from 'assets/icons/history/withdrawal-icon.svg'

export type CryptoAndFiatHistoryType = {
  transactionType: string
  icon: string
  assetId?: string
  title?: string
  amount?: string
  time?: string
  fromAssetId?: string
  fromAmount?: string
  toAssetId?: string
  toAmount?: string
  rate?: string
  status?: 'PENDING' | 'COMPLETED' | 'FAILED'
  rewardName?: string
  rewardTime?: string
  iban?: string
  senderName?: string
  transactionTime?: string
  depositAddressId?: string
  merchantName?: string
  exchangeRate?: string
  transactionAmount?: string
  transactionDate?: string
}
//TODO OLD  check and  delete
export const TITLE_TXN_HISTORY = {
  DEPOSIT: 'Deposit',
  WITHDRAWAL: 'Withdrawal',
  EXCHANGE: 'Exchange',
  EARNING_REWARD: 'Earning Reward', // old REWARD
  EARNING_CLAIMED: 'Earning Claimed', // old CLAIMED
  CASHBACK: 'Cashback',
  TOP_UP: 'Top Up',
  CAMPAIGN_REWARD: 'Campaign Reward',
  REFERRAL_BONUS: 'Referral Bonus',
  STAKE_ALLOCATION: 'Stake Allocation', // withdrawalIconSvg
  REFUND_CLAIM: 'Refund Claim', //depositIconSvg
  TOKEN_CLAIM: 'Token Claim', //depositIconSvg
}

export const $transactionsHistory = createStore<any[]>([])

export const getTransactionsHistoryFx = createEffect(async () => {
  const deposits = await TransactionsServices.getHistoryDeposit()
  const preparedDeposit = deposits.map(deposit => ({
    ...deposit,
    title: TITLE_TXN_HISTORY.DEPOSIT,
    transactionType: TYPE_TXN_HISTORY.CRYPTO,
    icon: depositIconSvg,
  }))

  const withdraws = await TransactionsServices.getHistoryWithdraw()
  const preparedWithdraws = withdraws.map(withdraw => ({
    ...withdraw,
    title: TITLE_TXN_HISTORY.WITHDRAWAL,
    transactionType: TYPE_TXN_HISTORY.CRYPTO,
    icon: withdrawalIconSvg,
  }))

  const exchanges = await TransactionsServices.getHistoryExchange()
  const preparedExchanges = exchanges.map(exchange => ({
    ...exchange,
    title: TITLE_TXN_HISTORY.EXCHANGE,
    transactionType: TYPE_TXN_HISTORY.CRYPTO,
    icon: exchangeIconSvg,
  }))

  const getRewardName = (name: string) => {
    switch (name) {
      case 'Staking Reward':
        return TITLE_TXN_HISTORY.EARNING_REWARD

      case 'Staking Claimed':
        return TITLE_TXN_HISTORY.EARNING_CLAIMED

      case 'Staking Campaign Claimed':
        return TITLE_TXN_HISTORY.CAMPAIGN_REWARD

      case 'Referral Bonus':
        return TITLE_TXN_HISTORY.REFERRAL_BONUS

      case 'Cash Back':
        return TITLE_TXN_HISTORY.CASHBACK

      default:
        return name
    }
  }

  const getRewardIcon = (name: string) => {
    switch (name) {
      case 'Staking Reward':
      case 'Referral Bonus':
      case 'Cash Back':
        return earningRewardIconSvg

      case 'Staking Claimed':
        return earningClaimedIconSvg

      default:
        return earningClaimedIconSvg
    }
  }

  const rewards = await TransactionsServices.getHistoryReward()

  const preparedReward = rewards
    .filter(reward => Number(reward?.amount) !== 0 /*  && reward.rewardName !== 'Cash Back' */)
    .map(reward => {
      return {
        ...reward,
        title: getRewardName(reward.rewardName),
        transactionType: TYPE_TXN_HISTORY.CRYPTO,
        icon: getRewardIcon(reward.rewardName),
      }
    })

  const result = [...preparedDeposit, ...preparedWithdraws, ...preparedExchanges, ...preparedReward]

  return result
})

$transactionsHistory.on(getTransactionsHistoryFx.doneData, (_, repos) => repos)
