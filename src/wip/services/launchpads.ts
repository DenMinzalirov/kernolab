import { request } from './base'

export interface LaunchpadProjectContract {
  type: string
  url: string
}

export interface LaunchpadProjectTag {
  name: string
}

export interface LaunchpadProjectIcon {
  iconType: string
  url: string
}

export interface UserLevelAllocation {
  userLevel: number
  isUnlimited: boolean
  supplyAllocationSize: 'string'
}

export interface ShortLaunchpadProject {
  projectId: string
  name: string
  iconUrl: string
  keyImageUrl: string
  shortDescription: string
  status: 'COMING_SOON' | 'ACTIVE' | 'FULLY_RAISED' | 'FINISHED' | 'NOT_RAISED' | 'CANCELED'
  supplyAssetId: string
  supplyAmount: string
  supplyRaisedAmount: string
  buyingAssetId: string
  buyingAssetPrice: string
  startDate: string
  launchDate: string
  claimAvailableFromDate: string
  contracts: LaunchpadProjectContract[]
  tags: LaunchpadProjectTag[]
  icons: LaunchpadProjectIcon[]
  userLevelAllocations: UserLevelAllocation[]
  precision: number
}

export interface SortObject {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export interface PageableObject {
  offset: number
  sort: SortObject
  pageNumber: number
  pageSize: number
  unpaged: boolean
  paged: boolean
}

export interface PageShortLaunchpadProject {
  totalPages: number
  totalElements: number
  size: number
  content: ShortLaunchpadProject[]
  number: number
  sort: SortObject
  numberOfElements: number
  pageable: PageableObject
  first: boolean
  last: boolean
  empty: boolean
}

export interface LaunchpadsRequest {
  page: string
  size: string
  // sort: string[]
}

export interface LaunchpadProject extends ShortLaunchpadProject {
  fullDescription: string
}

export interface LaunchpadUserAllocation {
  projectUuid: string
  assetId: string
  totalPurchasedAmount: string
  status: 'PENDING' | 'CLAIMED'
}

export interface calculateAllocationLaunchpadRequest {
  projectUuid: string
  amount: string
}

export interface LaunchpadTargetAllocation {
  currentUserLevel: number
  targetUserLevel: number
  feeAssetId: string
  fee: string
  supplyAllocationSize: string
  isUnlimited: boolean
}

export interface PageLaunchpadUserAllocation {
  totalPages: number
  totalElements: number
  size: number
  content: LaunchpadUserAllocation[]
  number: number
  sort: SortObject
  numberOfElements: number
  pageable: PageableObject
  first: boolean
  last: boolean
  empty: boolean
}

const getLaunchpads = (data: LaunchpadsRequest): Promise<PageShortLaunchpadProject> =>
  request({ url: `/public/v4/launchpads?page=${data.page}&size=${data.size}`, method: 'GET' })

const getLaunchpad = (projectUuid: string): Promise<LaunchpadProject> =>
  request({ url: `/public/v4/launchpads/${projectUuid}`, method: 'GET' })

const getAllocationLaunchpad = (projectUuid: string): Promise<LaunchpadUserAllocation> =>
  request({ url: `/public/v4/launchpads/${projectUuid}/allocation`, method: 'GET' })

const getAllocationsLaunchpads = (data: LaunchpadsRequest): Promise<PageLaunchpadUserAllocation> =>
  request({ url: `/public/v4/launchpads/allocations?page=${data.page}&size=${data.size}`, method: 'GET' })

const calculateAllocationLaunchpad = (data: calculateAllocationLaunchpadRequest): Promise<LaunchpadTargetAllocation> =>
  request({ url: `/public/v4/launchpads/${data.projectUuid}/allocation/calculate`, data: { amount: data.amount } })

const createAllocationLaunchpad = (data: calculateAllocationLaunchpadRequest): Promise<LaunchpadUserAllocation> =>
  request({ url: `/public/v4/launchpads/${data.projectUuid}/allocation/create`, data: { amount: data.amount } })

const createRefundLaunchpad = (projectUuid: string): Promise<LaunchpadUserAllocation> =>
  request({ url: `/public/v4/launchpads/${projectUuid}/allocation/refund` })

const createClaimLaunchpad = (projectUuid: string): Promise<LaunchpadUserAllocation> =>
  request({ url: `/public/v4/launchpads/${projectUuid}/allocation/claim` })

export const LaunchpadService = {
  getLaunchpads,
  getLaunchpad,
  getAllocationLaunchpad,
  getAllocationsLaunchpads,
  calculateAllocationLaunchpad,
  createAllocationLaunchpad,
  createRefundLaunchpad,
  createClaimLaunchpad,
}
