import { request } from '../base'

interface SortObject {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

interface PageableObject {
  offset: number
  sort: SortObject
  pageNumber: number
  pageSize: number
  unpaged: boolean
  paged: boolean
}

export enum CommissionType {
  DIRECT = 'DIRECT',
  INDIRECT = 'INDIRECT',
}

export enum CommissionStatus {
  PENDING = 'PENDING',
  PAYED_OUT = 'PAYED_OUT',
}

export interface TransportCommission {
  id: number
  memberUuid: string
  referredMemberUuid: string
  memberEmail?: string
  referredMemberEmail: string
  amount: string
  commissionType: CommissionType
  depth: number
  commissionStatus: CommissionStatus
  createdAt: string
  updatedAt: string
}

export interface PageTransportCommission {
  totalPages: number
  totalElements: number
  size: number
  content: TransportCommission[]
  number: number
  sort: SortObject
  numberOfElements: number
  pageable: PageableObject
  first: boolean
  last: boolean
  empty: boolean
}

export interface TierResponse {
  name: string
  amountNeeded: string
}

export type MembershipPricesResponse = Record<string, string>

export interface MembershipStatusResponse {
  userUuid: string
  invitedBy: string
  isActive: boolean
  availableCommissions: string
  totalCommissionsEarned: string
  lifetimeSales: string
  createdAt: string
  updatedAt: string
}

export interface RequestCashoutBody {
  assetId: string
  amount: string
}

export interface XanovaCommissionQueryParams {
  amount_eq?: string
  amount_ne?: string
  amount_gt?: string
  amount_lt?: string
  amount_ge?: string
  amount_le?: string
  amount_in?: string[]
  amount_not?: string[]
  amount_from?: string
  amount_to?: string
  commissionStatus_eq?: CommissionStatus
  commissionStatus_ne?: CommissionStatus
  commissionStatus_in?: CommissionStatus
  commissionStatus_not?: CommissionStatus[]
  commissionType_eq?: CommissionType
  commissionType_ne?: CommissionType
  commissionType_in?: CommissionType
  commissionType_not?: CommissionType[]
  createdAt_gt?: string
  createdAt_lt?: string
  createdAt_ge?: string
  createdAt_le?: string
  createdAt_from?: string
  createdAt_to?: string
  depth_eq?: number
  depth_ne?: number
  depth_gt?: number
  depth_lt?: number
  depth_ge?: number
  depth_le?: number
  depth_in?: number[]
  depth_not?: number[]
  depth_from?: number
  depth_to?: number
  id_eq?: number
  id_ne?: number
  id_gt?: number
  id_lt?: number
  id_ge?: number
  id_le?: number
  id_in?: number[]
  id_not?: number[]
  id_from?: number
  id_to?: number
  referredMemberUuid_eq?: string
  referredMemberUuid_ne?: string
  referredMemberUuid_in?: string[]
  referredMemberUuid_not?: string[]
  sale_eq?: string
  sale_ne?: string
  sale_gt?: string
  sale_lt?: string
  sale_ge?: string
  sale_le?: string
  sale_in?: string[]
  sale_not?: string[]
  sale_from?: string
  sale_to?: string
  updatedAt_gt?: string
  updatedAt_lt?: string
  updatedAt_ge?: string
  updatedAt_le?: string
  updatedAt_from?: string
  updatedAt_to?: string
  page?: number
  size?: number
  sort?: string | string[]
}

const requestCashout = (data: RequestCashoutBody): Promise<void> =>
  request({
    url: '/public/v4/xanova/cashout',
    method: 'POST',
    data,
  })

const getMembershipTiers = (): Promise<TierResponse[]> =>
  request({
    url: '/public/v4/xanova/membership/tiers',
    method: 'GET',
  })

const getCurrentMembershipTier = (): Promise<TierResponse> =>
  request({
    url: '/public/v4/xanova/membership/tier',
    method: 'GET',
  })

const getMembershipStatus = (): Promise<MembershipStatusResponse> =>
  request({
    url: '/public/v4/xanova/membership/status',
    method: 'GET',
  })

const getMembershipPrices = (): Promise<MembershipPricesResponse> =>
  request({
    url: '/public/v4/xanova/membership/prices',
    method: 'GET',
  })

const getXanovaCommissions = (params?: XanovaCommissionQueryParams): Promise<PageTransportCommission> => {
  return request({
    url: '/public/v4/xanova/membership/commissions',
    method: 'GET',
    data: params,
  })
}

const getSubmittedForm = (formName: string): Promise<any> =>
  request({
    url: `/public/v4/xanova/form/${formName}`,
    method: 'POST',
  })

const submitForm = (formName: string, data: Record<string, any>): Promise<void> =>
  request({
    url: `/public/v4/xanova/form/${formName}/submit`,
    method: 'POST',
    data,
  })

export const XanovaServices = {
  requestCashout,
  getMembershipTiers,
  getCurrentMembershipTier,
  getMembershipStatus,
  getMembershipPrices,
  getXanovaCommissions,
  getSubmittedForm,
  submitForm,
}
