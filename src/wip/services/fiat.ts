import { request } from './base'

export enum StatusBankAddress {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  BLOCKED = 'BLOCKED',
  REJECTED = 'REJECTED ',
}

export type SortAddress = {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export type PageableObject = {
  offset: number
  sort: SortAddress
  unpaged: boolean
  pageNumber: number
  pageSize: number
  paged: boolean
}

export type BankAddressResponse = {
  addressUuid: string
  iban: string
  name: string
  status: StatusBankAddress
  bankIdentifier: string
  operationType: 'SEPA' | 'SWIFT_XML' | 'UNSUPPORTED'
}

export type PageBankAddressResponse = {
  totalPages: number
  totalElements: number
  size: number
  content: BankAddressResponse[]
  number: number
  sort: SortAddress
  numberOfElements: number
  pageable: PageableObject
  first: boolean
  last: boolean
  empty: boolean
}

interface BeneficiaryInfoResponse {
  accountHolderName: string
  iban: string
  bankName: string
  bicCode: string
  swiftCode: string
  bankAddress: string
}

export interface DepositInfoResponse {
  referenceCode: string
  beneficiaryInfo: BeneficiaryInfoResponse
}

export interface FiatWithdrawCreateInfoRequest {
  operationType: string
  bankAddressUuid: string
  amount: string
}

export interface WithdrawalOfferResponse {
  transactionId: number
  operationType: string
  bankAddressUuid: string
  amount: string
  fee: string
}

export interface WithdrawalRequest {
  // operationType: 'INTERNAL' | 'SEPA' | 'SWIFT_XML'
  bankAddressUuid: string
  amount: string
  fee: string
  token: string
}

export interface UserLimitResponse {
  maxWithdrawalAmount: string
  maxDepositAmount: string
  minWithdrawalAmount: string
  minDepositAmount: string
}

const getAllBankAddress = (): Promise<PageBankAddressResponse> =>
  request({ url: `/public/v3/bank-address/all?status=APPROVED`, method: 'GET' })

const fiatWithdrawal = (data: WithdrawalRequest): Promise<WithdrawalOfferResponse> =>
  request({ url: `/public/v4/fiat/withdrawal`, data, token: data.token })

const fiatWithdrawalInfo = (data: FiatWithdrawCreateInfoRequest): Promise<WithdrawalOfferResponse> =>
  request({ url: `/public/v4/fiat/withdrawal`, data, method: 'GET' })

const getFiatDepositInfo = (): Promise<DepositInfoResponse> =>
  request({ url: `/public/v4/fiat/deposit-info`, method: 'GET' })

const getFiatLimits = (): Promise<UserLimitResponse> => request({ url: `/public/v4/fiat/limit`, method: 'GET' })

export const FiatService = {
  getAllBankAddress,
  fiatWithdrawal,
  fiatWithdrawalInfo,
  getFiatDepositInfo,
  getFiatLimits,
}
