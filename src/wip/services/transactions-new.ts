import { request } from './base'

const URL = '/public/v4/assets2/my/history'

export type SortParamsType = {
  field: string
  sort: 'desc' | 'asc' | null | undefined
}

export enum OperationType {
  CRYPTO_DEPOSIT = 'CRYPTO_DEPOSIT',
  FIAT_DEPOSIT = 'FIAT_DEPOSIT',
  CRYPTO_WITHDRAW = 'CRYPTO_WITHDRAW',
  FIAT_WITHDRAW = 'FIAT_WITHDRAW',
  EXCHANGE = 'EXCHANGE',
  CASHBACK = 'CASHBACK',
  REWARD = 'REWARD',
  LAUNCHPAD_CLAIM_REFUND = 'LAUNCHPAD_CLAIM_REFUND',
  LAUNCHPAD_CLAIM_TOKEN = 'LAUNCHPAD_CLAIM_TOKEN',
  LAUNCHPAD_STAKE_ALLOCATION = 'LAUNCHPAD_STAKE_ALLOCATION',
  STAKING_CAMPAIGN_CREATE = 'STAKING_CAMPAIGN_CREATE',
  STAKING_POS_CREATE = 'STAKING_POS_CREATE',
  STAKING_ROLLING_CREATE = 'STAKING_ROLLING_CREATE',
  STAKING_ROLLING_LEVELED_CREATE = 'STAKING_ROLLING_LEVELED_CREATE',
  STAKING_SIMPLE_CREATE = 'STAKING_SIMPLE_CREATE',
  STAKING_CAMPAIGN_CLOSE = 'STAKING_CAMPAIGN_CLOSE',
  STAKING_POS_CLOSE = 'STAKING_POS_CLOSE',
  STAKING_ROLLING_CLOSE = 'STAKING_ROLLING_CLOSE',
  STAKING_ROLLING_LEVELED_CLOSE = 'STAKING_ROLLING_LEVELED_CLOSE',
  STAKING_SIMPLE_CLOSE = 'STAKING_SIMPLE_CLOSE',
  STAKING_REWARD = 'STAKING_REWARD',
  OTC_DEPOSIT = 'OTC_DEPOSIT',
  OTC_REFUND = 'OTC_REFUND',
  OTC_EXCHANGE = 'OTC_EXCHANGE',
}

export type OperationHistoryResponse = {
  id: number
  userUuid: string
  operationTime: string
  operationType: OperationType
}

// Тип для SortObject
export type SortObject = {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export type PageableObject = {
  offset: number
  sort: SortObject
  unpaged: boolean
  paged: boolean
  pageNumber: number
  pageSize: number
}

export type PageOperationHistoryResponse = {
  totalPages: number
  totalElements: number
  size: number
  content: OperationHistoryResponse[]
  number: number
  sort: SortObject
  numberOfElements: number
  pageable: PageableObject
  first: boolean
  last: boolean
  empty: boolean
}

export type CashbackOperationResponse = {
  id: number
  operationId: string
  userUuid: string
  cashbackAssetId: string
  merchantName: string
  cashbackAmount: string
  exchangeRate: string
  transactionDate: string
}

export type CryptoDepositOperationResponse = {
  id: number
  userUuid: string
  networkId: string
  sourceAddress: string
  targetAddress: string
  blockchainHash: string
  fbTxId: string
  rejectReason: string
}

export type CryptoWithdrawOperationResponse = {
  id: number
  userUuid: string
  withdrawalHotVaultId: string
  networkId: string
  destinationAddress: string
  destinationTag: string
  blockchainHash: string
  fbTxId: string
  rejectReason: string
  internalTransaction: boolean
  destinationUserUuid: string
  frozenDepositToDestinationOperationId: string
}

export type DepositOperationResponse = {
  id: number
  userUuid: string
  depositOperationId: string
  assetId: string
  amount: string
  fee: string
  depositType: 'FIAT' | 'CRYPTO'
}

export type ExchangeOperationResponse = {
  id: number
  operationId: string
  userUuid: string
  fromAssetId: string
  fromAmount: string
  toAssetId: string
  toAmount: string
  feeAmount: string
  exchangeRate: string
}

export type FiatDepositOperationResponse = {
  id: number
  userUuid: string
  bankeraOperationId: string
  bankeraLastUpdate: string
  bankAddressUuid: string
  operationType: string
  beneficiaryIban: string
  payerIban: string
  payerName: string
}

export type FiatWithdrawOperationResponse = {
  id: number
  bankeraOperationId: string
  userUuid: string
  bankAddressUuid: string
  iban: string
}

export type LaunchpadClaimRefundOperationResponse = {
  id: number
  projectUuid: string
  projectName: string
  userUuid: string
  buyingAssetId: string
  totalBuyingAmount: string
  operationUuid: string
}

export type LaunchpadClaimTokenOperationResponse = {
  id: number
  projectUuid: string
  projectName: string
  userUuid: string
  supplyAssetId: string
  totalPurchasedAmount: string
  operationUuid: string
}

export type LaunchpadStakeAllocationOperationResponse = {
  id: number
  projectUuid: string
  projectName: string
  userUuid: string
  supplyAssetId: string
  amount: string
  feeAssetId: string
  feeAmount: string
  buyingAssetId: string
  buyingPrice: string
  buyingAmount: string
  operationUuid: string
}

export type RewardOperationResponse = {
  id: number
  operationId: string
  userUuid: string
  rewardName: string
  assetId: string
  amount: string
}

export type WithdrawOperationResponse = {
  id: number
  freezeOperationId: string
  withdrawFrozenOperationId: string
  userUuid: string
  assetId: string
  amount: string
  fee: string
  withdrawType: 'FIAT' | 'CRYPTO'
  withdrawStatus: 'PENDING' | 'COMPLETED' | 'REFUSED' | 'TRAVEL_RULE_PENDING'
}

export type StakingCampaignCloseOperationResponse = {
  id: number
  userUuid: string
  assetId: string
  payedAssetId: string
  planId: number
  amount: string
  payedRewardAmount: string
  closeOperationId: string
}

export type StakingCampaignCreateOperationResponse = {
  id: number
  userUuid: string
  assetId: string
  planId: number
  amount: string
  openOperationId: string
}

export type StakingPosCloseOperationResponse = {
  id: number
  userUuid: string
  assetId: string
  planId: number
  amount: string
  planDescription: string
  closeOperationId: string
}

export type StakingPosCreateOperationResponse = {
  id: number
  userUuid: string
  assetId: string
  planId: number
  stakingApyPercent: string
  amount: string
  planDescription: string
  openOperationId: string
}
export enum StakingType {
  STAKING_CAMPAIGN = 'STAKING_CAMPAIGN',
  STAKING_POS = 'STAKING_POS',
  STAKING_ROLLING = 'STAKING_ROLLING',
  STAKING_ROLLING_LEVELED = 'STAKING_ROLLING_LEVELED',
  STAKING_SIMPLE = 'STAKING_SIMPLE',
}
export type StakingRewardOperationResponse = {
  id: number
  userUuid: string
  operationId: string
  rewardName: string
  stakingType: StakingType
  assetId: string
  amount: string
}

export type StakingRollingCloseOperationResponse = {
  id: number
  userUuid: string
  assetId: string
  planId: number
  amount: string
  planDescription: string
  closeOperationId: string
}

export type StakingRollingCreateOperationResponse = {
  id: number
  userUuid: string
  assetId: string
  planId: number
  stakingApyPercent: string
  amount: string
  planDescription: string
  openOperationId: string
}

export type StakingRollingLeveledCloseOperationResponse = {
  id: number
  userUuid: string
  assetId: string
  targetAssetId: string
  planId: number
  currentlyPayedReward: string
  amount: string
  planDescription: string
  closeOperationId: string
}

export type StakingRollingLeveledCreateOperationResponse = {
  id: number
  userUuid: string
  assetId: string
  targetAssetId: string
  planId: number
  stakingApyPercent: string
  amount: string
  increasedByAmount: string
  requiredAmount: string
  targetRequiredAmount: string
  targetRate: string
  planDescription: string
  openOperationId: string
}

export type StakingSimpleCloseOperationResponse = {
  id: number
  userUuid: string
  assetId: string
  planId: number
  amount: string
  planDescription: string
  closeOperationId: string
}

export type StakingSimpleCreateOperationResponse = {
  id: number
  userUuid: string
  assetId: string
  planId: number
  stakingApyPercent: string
  amount: string
  userLevel: number
  planDescription: string
  openOperationId: string
}

export type OTCDepositOperationResponse = {
  id: number
  depositOperationId: string
  otcRequestId: number
  userUuid: string
  assetFromId: string
  assetToId: string
  fromAmount: string
}

export type OTCDepositRefundOperationResponse = {
  id: number
  refundOperationId: string
  otcRequestId: number
  userUuid: string
  assetFromId: string
  assetToId: string
  fromAmount: string
  toTotalAmount: string
  toFeeAmount: string
  toAmount: string
  rate: string
}

export type OTCExchangeOperation = {
  id: number
  exchangeOperationId: string
  otcRequestId: number
  userUuid: string
  assetFromId: string
  assetToId: string
  fromAmount: string
  toTotalAmount: string
  toFeeAmount: string
  toAmount: string
  rate: string
}

export type GetOperationHistoryParams = {
  from: string
  to: string
  operationTypes: OperationType[]
  assetIds: string[]
  page?: number
  size?: number
  sort?: SortParamsType[]
}

const getOperationHistory = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageOperationHistoryResponse> => {
  const params = new URLSearchParams()

  if (from) params.set('from', from)
  if (to) params.set('to', to)
  if (operationTypes?.length) {
    operationTypes.forEach(operationType => {
      params.append('operationTypes', operationType)
    })
  }
  if (assetIds?.length) {
    assetIds.forEach(assetId => {
      params.append('assetIds', assetId)
    })
  } else {
    params.append('assetIds', '')
  }

  params.set('page', String(page))
  params.set('size', String(size))
  if (sort?.length) {
    sort.forEach(param => {
      params.append('sort', `${param.field},${param.sort}`)
    })
  }
  const queryString = params.toString()
  return request({ url: `${URL}?${queryString}`, method: 'GET' })
}

const getCashbackHistory = (operationIds: number[]): Promise<CashbackOperationResponse[]> => {
  return request({ url: `${URL}/cashback`, data: operationIds })
}

const getCryptoDepositHistory = (operationIds: number[]): Promise<CryptoDepositOperationResponse[]> => {
  return request({ url: `${URL}/crypto-deposit`, data: operationIds })
}

const getCryptoWithdrawHistory = (operationIds: number[]): Promise<CryptoWithdrawOperationResponse[]> => {
  return request({ url: `${URL}/crypto-withdraw`, data: operationIds })
}
const getDepositHistory = (operationIds: number[]): Promise<DepositOperationResponse[]> => {
  return request({ url: `${URL}/deposit`, data: operationIds })
}

const getExchangeHistory = (operationIds: number[]): Promise<ExchangeOperationResponse[]> => {
  return request({ url: `${URL}/exchange`, data: operationIds })
}

const getFiatDepositHistory = (operationIds: number[]): Promise<FiatDepositOperationResponse[]> => {
  return request({ url: `${URL}/fiat-deposit`, data: operationIds })
}

const getFiatWithdrawHistory = (operationIds: number[]): Promise<FiatWithdrawOperationResponse[]> => {
  return request({ url: `${URL}/fiat-withdraw`, data: operationIds })
}

const getLaunchpadClaimRefundHistory = (operationIds: number[]): Promise<LaunchpadClaimRefundOperationResponse[]> => {
  return request({ url: `${URL}/launchpad/claim-refund`, data: operationIds })
}

const getLaunchpadClaimTokenHistory = (operationIds: number[]): Promise<LaunchpadClaimTokenOperationResponse[]> => {
  return request({ url: `${URL}/launchpad/claim-token`, data: operationIds })
}

const getLaunchpadStakeAllocationHistory = (
  operationIds: number[]
): Promise<LaunchpadStakeAllocationOperationResponse[]> => {
  return request({ url: `${URL}/launchpad/stake-allocation`, data: operationIds })
}

const getRewardHistory = (operationIds: number[]): Promise<RewardOperationResponse[]> => {
  return request({ url: `${URL}/reward`, data: operationIds })
}

const stakingCampaignCloseHistory = (operationIds: number[]): Promise<StakingCampaignCloseOperationResponse[]> => {
  return request({ url: `${URL}/staking/campaign-close`, data: operationIds })
}

const stakingCampaignCreateHistory = (operationIds: number[]): Promise<StakingCampaignCreateOperationResponse[]> => {
  return request({ url: `${URL}/staking/campaign-create`, data: operationIds })
}

const stakingPosCloseHistory = (operationIds: number[]): Promise<StakingPosCloseOperationResponse[]> => {
  return request({ url: `${URL}/staking/pos-close`, data: operationIds })
}

const stakingPosCreateHistory = (operationIds: number[]): Promise<StakingPosCreateOperationResponse[]> => {
  return request({ url: `${URL}/staking/pos-create`, data: operationIds })
}

const stakingRewardHistory = (operationIds: number[]): Promise<StakingRewardOperationResponse[]> => {
  return request({ url: `${URL}/staking/reward`, data: operationIds })
}

const stakingRollingCloseHistory = (operationIds: number[]): Promise<StakingRollingCloseOperationResponse[]> => {
  return request({ url: `${URL}/staking/rolling-close`, data: operationIds })
}

const stakingRollingCreateHistory = (operationIds: number[]): Promise<StakingRollingCreateOperationResponse[]> => {
  return request({ url: `${URL}/staking/rolling-create`, data: operationIds })
}

const stakingRollingLeveledCloseHistory = (
  operationIds: number[]
): Promise<StakingRollingLeveledCloseOperationResponse[]> => {
  return request({ url: `${URL}/staking/rolling-leveled-close`, data: operationIds })
}

const stakingRollingLeveledCreateHistory = (
  operationIds: number[]
): Promise<StakingRollingLeveledCreateOperationResponse[]> => {
  return request({ url: `${URL}/staking/rolling-leveled-create`, data: operationIds })
}

const stakingSimpleCloseHistory = (operationIds: number[]): Promise<StakingSimpleCloseOperationResponse[]> => {
  return request({ url: `${URL}/staking/simple-close`, data: operationIds })
}

const stakingSimpleCreateHistory = (operationIds: number[]): Promise<StakingSimpleCreateOperationResponse[]> => {
  return request({ url: `${URL}/staking/simple-create`, data: operationIds })
}

const getWithdrawHistory = (operationIds: number[]): Promise<WithdrawOperationResponse[]> => {
  return request({ url: `${URL}/withdraw`, data: operationIds })
}

const otcDepositHistory = (operationIds: number[]): Promise<OTCDepositOperationResponse[]> => {
  return request({ url: `${URL}/otc/deposit`, data: operationIds })
}

const otcDepositRefundHistory = (operationIds: number[]): Promise<OTCDepositRefundOperationResponse[]> => {
  return request({ url: `${URL}/otc/deposit-refund`, data: operationIds })
}

const otcExchangeHistory = (operationIds: number[]): Promise<OTCExchangeOperation[]> => {
  return request({ url: `${URL}/otc/exchange`, data: operationIds })
}

export const TransactionsNewServices = {
  getOperationHistory,
  getCashbackHistory,
  getCryptoDepositHistory,
  getCryptoWithdrawHistory,
  getDepositHistory,
  getExchangeHistory,
  getFiatDepositHistory,
  getFiatWithdrawHistory,
  getLaunchpadClaimRefundHistory,
  getLaunchpadClaimTokenHistory,
  getLaunchpadStakeAllocationHistory,
  getRewardHistory,

  getWithdrawHistory,

  stakingCampaignCloseHistory,
  stakingCampaignCreateHistory,
  stakingPosCloseHistory,
  stakingPosCreateHistory,
  stakingRewardHistory,
  stakingRollingCloseHistory,
  stakingRollingCreateHistory,
  stakingRollingLeveledCloseHistory,
  stakingRollingLeveledCreateHistory,
  stakingSimpleCloseHistory,
  stakingSimpleCreateHistory,

  otcDepositHistory,
  otcDepositRefundHistory,
  otcExchangeHistory,
}
