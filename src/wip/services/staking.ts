import { request } from './base'

interface CreateClaimData {
  contractId: string
}

export interface StakingPlansResponse {
  simplePlans: SimpleStakingPlansResponse[]
  rollingPlans: RollingStakingPlansResponse[]
  rollingLeveledPlans: RollingLeveledStakingPlansResponse[]
  campaignPlans: StakingCampaignResponse[]
}

export interface StakingCampaignResponse {
  id: number
  assetId: string
  lockupDate: string
  startDate: string
  endDepositDate: string
  requiredUserLevel: number
  minimalStakingAmount: string
  prizePoolAmount: string
  prizePoolAssetId: string
  currentStakingAmount: string
}

export interface SimpleStakingPlansResponse {
  // isRollingPlans: boolean;
  id: number
  assetId: string
  stakingPeriod: number
  minimalStakingAmount: number
  stakingApyPercent: number
}

export interface RollingStakingPlansResponse {
  id: number
  assetId: string
  stakingPeriod: number
  minimalStakingAmount: number
  stakingApyPercent: number
  minimalPlanAmount: number
}

export interface RollingLeveledStakingPlansResponse {
  id: number
  assetId: string
  stakingPeriod: number
  minimalStakingAmount: number
  stakingApyPercent: number
  minimalPlanAmount: number
  minimalTargetPlanAmount: string
  targetAssetId: string
}

export interface SimpleStakingContractResponse {
  isSimple?: boolean
  id: number
  assetId: string
  planId: number
  openDate: string
  expectedCloseDate: string
  stakingApyPercent: string
  amount: string
  payedRewardAmount: string
  expectedRewardAmount: string
}

export interface RollingStakingContractResponse {
  isRollingResponses?: boolean
  id: number
  assetId: string
  planId: number
  openDate: string
  expectedCloseDate: string
  stakingApyPercent: string
  amount: string
  payedRewardAmount: string
  expectedRewardAmount: string
}

export interface RollingLeveledStakingContractResponse {
  isRollingLeveled?: boolean
  id: number
  assetId: string
  planId: number
  openDate: string
  expectedCloseDate: string
  stakingApyPercent: string
  amount: string
  payedRewardAmount: string
  expectedRewardAmount: string
}

export interface StakingCampaignContractResponse {
  id: number
  userUuid: string
  assetId: string
  campaignId: number
  openDate: string
  closeDate: string
  paidDate: string
  userStakingAmount: string
  estimatedRewardAmount: string
  payedRewardAmount: string
  payedAssetId: string
}

export interface StakingContractsResponse {
  simpleContracts: StakingContract[]
  rollingResponses: StakingContract[]
  rollingLeveledContracts: StakingContract[]
  posContracts: StakingContract[]
  campaignContracts: StakingCampaignContractResponse[]
}

export interface StakingContract {
  isRollingLeveled?: boolean
  isSimple?: boolean
  isRollingResponses?: boolean
  id: number
  assetId: string
  planId: number
  openDate: string
  expectedCloseDate: string
  stakingApyPercent: number
  amount: number
  payedRewardAmount: number
  expectedRewardAmount: number
}

export interface CreateStakingRequest {
  planId: number
  amount: number
}

export interface StakingCampaignContractUpdateRequest {
  contractId: number
  campaignId: number
  userStakingAmount: number
}

const contracts = (): Promise<StakingContractsResponse> => request({ url: '/public/staking/contracts', method: 'GET' })

const simpleCreate = (data: CreateStakingRequest): Promise<RollingLeveledStakingContractResponse> =>
  request({ url: '/public/staking/contracts/simple/create', data })

const rollingCreate = (data: CreateStakingRequest): Promise<RollingLeveledStakingContractResponse> =>
  request({ url: '/public/staking/contracts/rolling-leveled/create', data })

const campaignCreate = (data: CreateStakingRequest): Promise<StakingCampaignContractResponse> =>
  request({ url: `/public/staking/contracts/campaign/create`, data })

const createRollingClaim = (data: CreateClaimData): Promise<RollingLeveledStakingContractResponse> =>
  request({ url: `/public/staking/contracts/rolling-leveled/${data.contractId}/claim`, data })

const createRollingClaimOld = (data: CreateClaimData): Promise<RollingLeveledStakingContractResponse> =>
  request({ url: `/public/staking/contracts/rolling/${data.contractId}/claim`, data })

const createSimpleClaim = (data: CreateClaimData): Promise<RollingLeveledStakingContractResponse> =>
  request({ url: `/public/staking/contracts/simple/${data.contractId}/claim`, data })

const stakingPlans = (): Promise<StakingPlansResponse> => request({ url: '/public/staking/plans', method: 'GET' })

const tierLevel = (): Promise<number> => request({ url: '/public/user-level', method: 'GET' })

const campaignUpdate = (data: StakingCampaignContractUpdateRequest): Promise<void> =>
  request({ url: `/public/staking/contracts/campaign/${data.contractId}/update`, data })

const campaignClaim = (id: number): Promise<void> => request({ url: `/public/staking/contracts/campaign/${id}/claim` })

export const StakingServices = {
  contracts,
  createRollingClaim,
  createSimpleClaim,
  createRollingClaimOld,
  stakingPlans,
  simpleCreate,
  rollingCreate,
  tierLevel,
  campaignCreate,
  campaignUpdate,
  campaignClaim,
}
