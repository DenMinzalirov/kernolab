import { request } from './base'

export enum WalletType {
  CUSTODIAL = 'CUSTODIAL',
  NON_CUSTODIAL = 'NON_CUSTODIAL',
  OTHER = 'OTHER',
}

export enum CustodialProvider {
  CRYPTO_COM = 'CRYPTO_COM',
  BINANCE = 'BINANCE',
  KRAKEN = 'KRAKEN',
  COINBASE = 'COINBASE',
  FTX = 'FTX',
  HUOBI = 'HUOBI',
  OKX = 'OKX',
  GEMINI = 'GEMINI',
  KUCOIN = 'KUCOIN',
  GATE_IO = 'GATE_IO',
}

export interface TravelRuleInfoRequest {
  walletType: WalletType
  fullName: string
  countryCode: string
  custodialProvider?: CustodialProvider | null
  otherProviderName?: string | null
}

export interface DepositTravelRuleInfoResponse {
  depositTransactionId: number
  walletType: WalletType
  senderFullName: string
  countryCode: string
  custodialProvider?: CustodialProvider
  otherProviderName?: string
}

export interface WithdrawalTravelRuleInfoResponse {
  withdrawalTransactionId: number
  walletType: WalletType
  custodialProvider?: CustodialProvider
  otherProviderName?: string
  receiverFullName: string
  countryCode: string
}

export interface TravelRuleDepositTransactionResponse {
  depositTransactionId: number //integer int64
  status: 'NOT_REQUIRED' | 'TRIGGERED' | 'UNVERIFIED' | 'VERIFIED' | 'REJECTED'
  createdAt: string //date-time
}

export interface TravelRuleWithdrawalTransactionResponse {
  withdrawalTransactionId: number //integer int64
  status: 'NOT_REQUIRED' | 'TRIGGERED' | 'UNVERIFIED' | 'VERIFIED' | 'REJECTED'
  createdAt: string //date-time
}

const submitDepositTransactionTravelRuleInfo = (
  transactionId: number,
  data: TravelRuleInfoRequest
): Promise<DepositTravelRuleInfoResponse> =>
  request({ url: `/public/v4/crypto/travel-rule/deposits/${transactionId}/submit`, data })
//
const submitWithdrawalTransactionTravelRuleInfo = (
  transactionId: number,
  data: TravelRuleInfoRequest
): Promise<WithdrawalTravelRuleInfoResponse> =>
  request({ url: `/public/v4/crypto/travel-rule/withdrawals/${transactionId}/submit`, data })

const getDepositTravelRuleTransactions = (): Promise<TravelRuleDepositTransactionResponse[]> =>
  request({ url: '/public/v4/crypto/travel-rule/deposits', method: 'GET' })

const getWithdrawalTravelRuleTransactions = (): Promise<TravelRuleWithdrawalTransactionResponse[]> =>
  request({ url: '/public/v4/crypto/travel-rule/withdrawals', method: 'GET' })

const submitTravelRuleDepositWalletOwnership = (transactionId: number): Promise<void> =>
  request({ url: `/public/v4/crypto/travel-rule/deposits/${transactionId}/ownership-submit` })

const submitTravelRuleWithdrawalWalletOwnership = (transactionId: number): Promise<void> =>
  request({ url: `/public/v4/crypto/travel-rule/withdrawals/${transactionId}/ownership-submit` })

export const CryptoTravelRuleService = {
  submitDepositTransactionTravelRuleInfo,
  submitWithdrawalTransactionTravelRuleInfo,

  getDepositTravelRuleTransactions,
  getWithdrawalTravelRuleTransactions,

  submitTravelRuleDepositWalletOwnership,
  submitTravelRuleWithdrawalWalletOwnership,
}
