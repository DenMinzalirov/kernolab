import { request } from './base'

export interface DepositOperation {
  assetId: string
  amount: number
  time: string
}

export interface ExchangeOperation {
  fromAssetId: string
  fromAmount: number
  toAssetId: string
  toAmount: number
  rate: number
  time: string
}

type WithdrawStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

export interface WithdrawOperation {
  assetId: string
  amount: number
  status: WithdrawStatus
  time: string
}

export interface RewardOperation {
  rewardName: string
  assetId: string
  amount: number
  rewardTime: string
}

export interface CashbackOperation {
  merchantName: string
  assetId: string
  amount: string
  exchangeRate: string
  transactionAmount: string
  rewardTime: string
}

const getHistoryDeposit = (): Promise<DepositOperation[]> =>
  request({ url: '/public/v4/assets/my/history/deposit', method: 'GET' })

const getHistoryFiatDeposit = (): Promise<DepositOperation[]> =>
  request({ url: '/public/v4/assets/my/history/fiat-deposit', method: 'GET' })

const getHistoryExchange = (): Promise<ExchangeOperation[]> =>
  request({ url: '/public/v4/assets/my/history/exchange', method: 'GET' })

const getHistoryWithdraw = (): Promise<WithdrawOperation[]> =>
  request({ url: '/public/v4/assets/my/history/withdraw', method: 'GET' })

const getHistoryFiatWithdraw = (): Promise<WithdrawOperation[]> =>
  request({ url: '/public/v4/assets/my/history/fiat-withdraw', method: 'GET' })

const getHistoryReward = (): Promise<RewardOperation[]> =>
  request({ url: '/public/v4/assets/my/history/reward', method: 'GET' })

const getHistoryCashback = (): Promise<CashbackOperation[]> =>
  request({ url: '/public/v4/assets/my/history/cashback', method: 'GET' })

export const TransactionsServices = {
  getHistoryDeposit,
  getHistoryExchange,
  getHistoryWithdraw,
  getHistoryReward,
  getHistoryFiatDeposit,
  getHistoryFiatWithdraw,
  getHistoryCashback,
}
