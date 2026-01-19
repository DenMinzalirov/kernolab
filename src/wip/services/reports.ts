import { request } from './base'

const URL = '/public/v4/assets2/my/report'

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

export interface PageResponse {
  totalPages: number
  totalElements: number
  size: number
  number: number
  sort: SortObject
  numberOfElements: number
  pageable: PageableObject
  first: boolean
  last: boolean
  empty: boolean
}

export interface CashbackFullResponse {
  id: number
  operationType: OperationType
  userUuid: string
  accountUuid: string
  operationId: string
  cashbackAssetId: string
  cashbackAmount: string
  accountCashbackAmount: string
  exchangeRate: string
  transactionAmount: string
  transactionCurrencyCode: string
  transactionDate: string
  accountAmount: string
  accountCurrencyCode: string
  merchantName: string
  cardName: string
  maskedCardNumber: string
  operationTime: string
}

export interface PageCashbackFullResponse extends PageResponse {
  content: CashbackFullResponse[]
}

export interface CryptoDepositFullResponse {
  id: number
  operationType: OperationType
  depositOperationId: string
  userUuid: string
  assetId: string
  amount: string
  fee: string
  networkId: string
  sourceAddress: string
  targetAddress: string
  blockchainHash: string
  fbTxId: string
  rejectReason: string
  operationTime: string
}

export interface PageCryptoDepositFullResponse extends PageResponse {
  content: CryptoDepositFullResponse[]
}

export interface CryptoWithdrawFullResponse {
  id: number
  operationType: OperationType
  freezeOperationId: string
  withdrawFrozenOperationId: string
  userUuid: string
  assetId: string
  amount: string
  fee: string
  withdrawStatus: 'PENDING' | 'COMPLETED' | 'REFUSED'
  withdrawalHotVaultId: string
  networkId: string
  destinationAddress: string
  destinationTag: string
  blockchainHash: string
  fbTxId: string
  internalTransaction: boolean
  destinationUserUuid: string
  rejectReason: string
  frozenDepositToDestinationOperationId: string
  operationTime: string
}

export interface PageCryptoWithdrawFullResponse extends PageResponse {
  content: CryptoWithdrawFullResponse[]
}

export interface ExchangeFullResponse {
  id: number
  operationType: OperationType
  operationId: string
  userUuid: string
  fromAssetId: string
  fromAmount: string
  toAssetId: string
  toAmount: string
  feeAmount: string
  exchangeRate: string
  operationTime: string
}

export interface PageExchangeFullResponse extends PageResponse {
  content: ExchangeFullResponse[]
}

export interface RewardFullResponse {
  id: number
  operationType: OperationType
  operationId: string
  userUuid: string
  rewardName: string
  assetId: string
  amount: string
  operationTime: string
}

export interface PageRewardFullResponse extends PageResponse {
  content: RewardFullResponse[]
}

export interface FiatDepositFullResponse {
  id: number
  operationType: OperationType
  depositOperationId: string
  userUuid: string
  assetId: string
  amount: string
  fee: string
  bankeraOperationId: string
  bankeraLastUpdate: string
  bankAddressUuid: string
  beneficiaryIban: string
  payerIban: string
  payerName: string
  operationTime: string
}

export interface PageFiatDepositFullResponse extends PageResponse {
  content: FiatDepositFullResponse[]
}

export interface FiatWithdrawFullResponse {
  id: number
  operationType: OperationType
  freezeOperationId: string
  withdrawFrozenOperationId: string
  userUuid: string
  assetId: string
  amount: string
  fee: string
  withdrawStatus: 'PENDING' | 'COMPLETED' | 'REFUSED'
  bankAddressUuid: string
  bankeraOperationId: string
  iban: string
  operationTime: string
}

export interface PageFiatWithdrawFullResponse extends PageResponse {
  content: FiatWithdrawFullResponse[]
}

export interface LaunchpadClaimRefundFullResponse {
  id: number
  operationType: OperationType
  operationUuid: string
  userUuid: string
  projectUuid: string
  projectName: string
  buyingAssetId: string
  totalBuyingAmount: string
  operationTime: string
}

export interface PageLaunchpadClaimRefundFullResponse extends PageResponse {
  content: LaunchpadClaimRefundFullResponse[]
}

export interface LaunchpadClaimTokenFullResponse {
  id: number
  operationType: OperationType
  operationUuid: string
  projectUuid: string
  projectName: string
  userUuid: string
  supplyAssetId: string
  totalPurchasedAmount: string
  operationTime: string
}

export interface PageLaunchpadClaimTokenFullResponse extends PageResponse {
  content: LaunchpadClaimTokenFullResponse[]
}

export interface LaunchpadStakeAllocationFullResponse {
  id: number
  operationType: OperationType
  operationUuid: string
  projectUuid: string
  projectName: string
  userUuid: string
  userLevelAllocation: number
  supplyAssetId: string
  amount: string
  feeAssetId: string
  feeAmount: string
  buyingAssetId: string
  buyingAmount: string
  buyingPrice: string
  operationTime: string
}

export interface PageLaunchpadStakeAllocationFullResponse extends PageResponse {
  content: LaunchpadStakeAllocationFullResponse[]
}

export interface StakingCampaignCloseFullResponse {
  id: number
  operationType: OperationType
  userUuid: string
  assetId: string
  payedAssetId: string
  planId: number
  amount: string
  payedRewardAmount: string
  closeOperationId: string
  operationTime: string
}

export interface PageStakingCampaignCloseFullResponse extends PageResponse {
  content: StakingCampaignCloseFullResponse[]
}

export interface StakingCampaignCreateFullResponse {
  id: number
  operationType: OperationType
  userUuid: string
  assetId: string
  planId: number
  amount: string
  openOperationId: string
  operationTime: string
}

export interface PageStakingCampaignCreateFullResponse extends PageResponse {
  content: StakingCampaignCreateFullResponse[]
}

type TStackingType =
  | 'STAKING_CAMPAIGN'
  | 'STAKING_POS'
  | 'STAKING_ROLLING'
  | 'STAKING_ROLLING_LEVELED'
  | 'STAKING_SIMPLE'

export interface StakingRewardFullResponse {
  id: number
  userUuid: string
  operationType: OperationType
  operationId: string
  rewardName: string
  stakingType: TStackingType
  assetId: string
  amount: string
  operationTime: string
}

export interface PageStakingRewardFullResponse extends PageResponse {
  content: StakingRewardFullResponse[]
}

export interface StakingRollingCloseFullResponse {
  id: number
  userUuid: string
  operationType: OperationType
  assetId: string
  planId: number
  amount: string
  planDescription: string
  closeOperationId: string
  operationTime: string
}

export interface PageStakingRollingCloseFullResponse extends PageResponse {
  content: StakingRollingCloseFullResponse[]
}

export interface StakingRollingCreateFullResponse {
  id: number
  userUuid: string
  operationType: OperationType
  assetId: string
  planId: number
  stakingApyPercent: string
  amount: string
  planDescription: string
  openOperationId: string
  operationTime: string
}

export interface PageStakingRollingCreateFullResponse extends PageResponse {
  content: StakingRollingCreateFullResponse[]
}

export interface StakingRollingLeveledCloseFullResponse {
  id: number
  userUuid: string
  assetId: string
  operationType: OperationType
  targetAssetId: string
  planId: number
  currentlyPayedReward: string
  amount: string
  planDescription: string
  closeOperationId: string
  operationTime: string
}

export interface PageStakingRollingLeveledCloseFullResponse extends PageResponse {
  content: StakingRollingLeveledCloseFullResponse[]
}

export interface StakingRollingLeveledCreateFullResponse {
  id: number
  userUuid: string
  assetId: string
  operationType: OperationType
  targetAssetId: string
  planId: number
  stakingApyPercent: string
  amount: string
  requiredAmount: string
  targetRequiredAmount: string
  targetRate: string
  planDescription: string
  openOperationId: string
  operationTime: string
}

export interface PageStakingRollingLeveledCreateFullResponse extends PageResponse {
  content: StakingRollingLeveledCreateFullResponse[]
}

export interface StakingSimpleCloseFullResponse {
  id: number
  userUuid: string
  operationType: OperationType
  assetId: string
  planId: number
  amount: string
  planDescription: string
  closeOperationId: string
  operationTime: string
}

export interface PageStakingSimpleCloseFullResponse extends PageResponse {
  content: StakingSimpleCloseFullResponse[]
}

export interface StakingSimpleCreateFullResponse {
  id: number
  userUuid: string
  operationType: OperationType
  assetId: string
  planId: number
  stakingApyPercent: string
  amount: string
  userLevel: number
  planDescription: string
  openOperationId: string
  operationTime: string
}

export interface PageStakingSimpleCreateFullResponse extends PageResponse {
  content: StakingSimpleCreateFullResponse[]
}

export interface OTCDepositRefundsFullResponse {
  id: number
  operationType: OperationType
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

export interface PageOTCDepositRefundsFullResponse extends PageResponse {
  content: OTCDepositRefundsFullResponse[]
}

export interface OTCDepositFullResponse {
  id: number
  operationType: OperationType
  depositOperationId: string
  otcRequestId: number
  userUuid: string
  assetFromId: string
  assetToId: string
  fromAmount: string
}

export interface PageOTCDepositFullResponse extends PageResponse {
  content: OTCDepositFullResponse[]
}

export interface OTCExchangeFullResponse {
  id: number
  operationType: OperationType
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

export interface PageOTCExchangeFullResponse extends PageResponse {
  content: OTCExchangeFullResponse[]
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

const createQueryString = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): string => {
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
      params.append('assetId', assetId)
    })
  } else {
    params.append('assetId', '')
  }

  params.set('page', String(page))
  params.set('size', String(size))
  if (sort?.length) {
    sort.forEach(param => {
      params.append('sort', `${param.field},${param.sort}`)
    })
  }

  return params.toString()
}

const getCashbackReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageCashbackFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/cashbacks?${queryString}`, method: 'GET' })
}

const getCryptoDepositReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageCryptoDepositFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/crypto-deposits?${queryString}`, method: 'GET' })
}

const getCryptoWithdrawReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageCryptoWithdrawFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/crypto-withdraws?${queryString}`, method: 'GET' })
}

const getExchangeReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageExchangeFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/exchanges?${queryString}`, method: 'GET' })
}

const getRewardsReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageRewardFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/rewards?${queryString}`, method: 'GET' })
}

const getFiatDepositsReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageFiatDepositFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/fiat-deposits?${queryString}`, method: 'GET' })
}

const getFiatWithdrawsReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageFiatWithdrawFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/fiat-withdraws?${queryString}`, method: 'GET' })
}

const getLaunchpadClaimRefundsReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageLaunchpadClaimRefundFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/launchpad-claim-refunds?${queryString}`, method: 'GET' })
}

const getLaunchpadClaimTokensReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageLaunchpadClaimTokenFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/launchpad-claim-tokens?${queryString}`, method: 'GET' })
}

const getLaunchpadStakeAllocationsReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageLaunchpadStakeAllocationFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/launchpad-stake-allocations?${queryString}`, method: 'GET' })
}

const getStakingCampaignClosesReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageStakingCampaignCloseFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/staking-campaign-closes?${queryString}`, method: 'GET' })
}

const getStakingCampaignCreatesReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageStakingCampaignCreateFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/staking-campaign-creates?${queryString}`, method: 'GET' })
}

const getStakingRewardsReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageStakingRewardFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/staking-rewards?${queryString}`, method: 'GET' })
}

const getStakingRollingClosesReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageStakingRollingCloseFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/staking-rolling-closes?${queryString}`, method: 'GET' })
}

const getStakingRollingCreatesReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageStakingRollingCreateFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/staking-rolling-creates?${queryString}`, method: 'GET' })
}

const getStakingRollingLeveledClosesReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageStakingRollingLeveledCloseFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/staking-rolling-leveled-closes?${queryString}`, method: 'GET' })
}

const getStakingRollingLeveledCreatesReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageStakingRollingLeveledCreateFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/staking-rolling-leveled-creates?${queryString}`, method: 'GET' })
}

const getStakingSimpleClosesReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageStakingSimpleCloseFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/staking-simple-closes?${queryString}`, method: 'GET' })
}

const getStakingSimpleCreatesReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageStakingSimpleCreateFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/staking-simple-creates?${queryString}`, method: 'GET' })
}

const getOTCDepositRefundsReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageOTCDepositRefundsFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/otc-deposit-refunds?${queryString}`, method: 'GET' })
}

const getOTCDepositsReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageOTCDepositFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/otc-deposits?${queryString}`, method: 'GET' })
}

const getOTCExchangesReport = ({
  from,
  to,
  operationTypes,
  assetIds = [],
  page = 0,
  size = 20,
  sort,
}: GetOperationHistoryParams): Promise<PageOTCExchangeFullResponse> => {
  const queryString = createQueryString({ from, to, operationTypes, assetIds, page, size, sort })
  return request({ url: `${URL}/otc-exchanges?${queryString}`, method: 'GET' })
} //public/v4/assets2/my/report/otc-exchanges

export const ReportServices = {
  getCashbackReport,
  getCryptoDepositReport,
  getCryptoWithdrawReport,
  getExchangeReport,
  getRewardsReport,

  getFiatDepositsReport,
  getFiatWithdrawsReport,

  getLaunchpadClaimRefundsReport,
  getLaunchpadClaimTokensReport,
  getLaunchpadStakeAllocationsReport,

  getStakingRewardsReport,

  getStakingCampaignClosesReport,
  getStakingCampaignCreatesReport,

  getStakingRollingClosesReport,
  getStakingRollingCreatesReport,
  getStakingRollingLeveledClosesReport,
  getStakingRollingLeveledCreatesReport,
  getStakingSimpleClosesReport,
  getStakingSimpleCreatesReport,

  getOTCDepositRefundsReport,
  getOTCDepositsReport,
  getOTCExchangesReport,
}
