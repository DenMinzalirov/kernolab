import { StakingType } from 'wip/services/transactions-new'

export type CryptoAndFiatHistoryTypeNew = {
  id: number
  userUuid: string
  operationTime: string
  operationType: string
  title: string
  icon: string
  depositOperationId?: string
  assetId?: string
  amount?: string
  fee?: string
  depositType?: 'FIAT' | 'CRYPTO'
  operationId?: string
  fromAssetId?: string
  fromAmount?: string
  toAssetId?: string
  toAmount?: string
  feeAmount?: string
  exchangeRate?: string
  rewardName?: string
  freezeOperationId?: string
  withdrawFrozenOperationId?: string
  withdrawType?: 'FIAT' | 'CRYPTO'
  withdrawStatus?: 'PENDING' | 'COMPLETED' | 'REFUSED' | 'TRAVEL_RULE_PENDING'
  projectUuid?: string
  projectName?: string
  buyingAssetId?: string
  totalBuyingAmount?: string
  operationUuid?: string
  supplyAssetId?: string
  totalPurchasedAmount?: string
  feeAssetId?: string
  buyingPrice?: string
  buyingAmount?: string
  //Cashback
  cashbackAssetId?: string
  merchantName?: string
  cashbackAmount?: string
  transactionDate?: string
  accountCashbackAmount?: string
  accountCurrencyCode?: string
  transactionAmount?: string
  transactionCurrencyCode?: string
  // staking reward
  stakingType: StakingType
}

export type UnifiedHistoryTypeForBiz = {
  // Common fields
  id: number
  userUuid: string
  operationTime: string
  operationType: string
  title: string
  icon: string

  // DepositOperationResponse fields
  depositOperationId?: string
  assetId?: string
  amount?: string
  fee?: string
  depositType?: 'FIAT' | 'CRYPTO'

  // FiatDepositOperationResponse fields
  bankeraOperationId?: string
  bankeraLastUpdate?: string
  bankAddressUuid?: string
  // operationType?: string TODO дубликат с главным запросом
  beneficiaryIban?: string
  payerIban?: string
  payerName?: string

  // ExchangeOperationResponse fields
  operationId?: string
  fromAssetId?: string
  fromAmount?: string
  toAssetId?: string
  toAmount?: string
  feeAmount?: string
  exchangeRate?: string

  // WithdrawOperationResponse fields
  freezeOperationId?: string
  withdrawFrozenOperationId?: string
  withdrawType?: 'FIAT' | 'CRYPTO'
  withdrawStatus?: 'PENDING' | 'COMPLETED' | 'REFUSED'

  // FiatWithdrawOperationResponse fields
  iban?: string

  // OTCDepositOperationResponse fields
  otcRequestId?: number
  assetFromId?: string
  assetToId?: string

  // OTCExchangeOperation and OTCDepositRefundOperationResponse fields
  exchangeOperationId?: string
  refundOperationId?: string
  toTotalAmount?: string
  toFeeAmount?: string
  rate?: string
}

export type StakingUniqueFieldsResponse = {
  title: string
  icon: string
  id: number
  userUuid: string
  assetId: string
  amount: string
  operationTime: string
  increasedByAmount?: string
  operationType?: string
  planId?: number
  planDescription?: string
  closeOperationId?: string
  openOperationId?: string
  stakingApyPercent?: string
  rewardName?: string
  stakingType?: StakingType
  operationId?: string
  payedAssetId?: string
  payedRewardAmount?: string
  currentlyPayedReward?: string
  targetAssetId?: string
  requiredAmount?: string
  targetRequiredAmount?: string
  targetRate?: string
  userLevel?: number
}
