import { request } from './base'

export interface OTCParams {
  page: number
  size: number
}

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

export enum OTCStatus {
  AWAITING_DEPOSIT = 'AWAITING_DEPOSIT',
  TRADE_REJECTED = 'TRADE_REJECTED',
  AWAITING_OFFER = 'AWAITING_OFFER',
  OFFER_RECEIVED = 'OFFER_RECEIVED',
  OFFER_REJECTED = 'OFFER_REJECTED',
  TRADE_COMPLETED = 'TRADE_COMPLETED',
}

export interface OTCOffer {
  id: number
  rate: string
  totalAmount: string
  feeAmount: string
  toReceiveAmount: string
  generatedAt: string
  validUntil: string
  accepted: boolean
}

export interface OTCResponse {
  id: number
  otcStatus: OTCStatus
  userUuid: string
  fromAssetId: string
  toAssetId: string
  fromAmount: string
  contactPhoneNumber: string
  contactEmailAddress: string
  contactFullName: string
  createdAt: string
  currentOffer: OTCOffer | null
}

export interface PageOTCResponse {
  totalPages: number
  totalElements: number
  size: number
  content: OTCResponse[]
  number: number
  sort: SortObject
  numberOfElements: number
  pageable: PageableObject
  first: boolean
  last: boolean
  empty: boolean
}

export interface OTCPair {
  fromAssetId: string
  toAssetId: string
  minimalAmount: string
}

interface OTCSubmitRequestBody {
  amountFrom: string
  contactPhoneNumber: string
  contactEmailAddress: string
  contactFullName: string
}

interface OTCOfferIdBody {
  otcOfferId: number
}

const getPairs = (): Promise<OTCPair[]> => request({ url: '/public/v4/otc/pairs', method: 'GET' })

const getAllUserRequests = (data: OTCParams): Promise<PageOTCResponse> =>
  request({ url: `/public/v4/otc/requests?page=${data.page}&size=${data.size}`, method: 'GET' })

const submitRequest = (assetIdFrom: string, assetIdTo: string, data: OTCSubmitRequestBody): Promise<OTCResponse> =>
  request({ url: `/public/v4/otc/requests/${assetIdFrom}/${assetIdTo}/submit`, data })

const depositFromBalance = (otcRequestId: number): Promise<OTCResponse> =>
  request({ url: `/public/v4/otc/requests/${otcRequestId}/deposit` })

const cancelDeposit = (otcRequestId: number): Promise<OTCResponse> =>
  request({ url: `/public/v4/otc/requests/${otcRequestId}/deposit/cancel` })

const acceptOffer = (otcRequestId: number, data: OTCOfferIdBody): Promise<OTCResponse> =>
  request({ url: `/public/v4/otc/requests/${otcRequestId}/offer/accept`, data })

const rejectOffer = (otcRequestId: number): Promise<OTCResponse> =>
  request({ url: `/public/v4/otc/requests/${otcRequestId}/offer/reject` })

const getUserRequest = (requestId: number): Promise<OTCResponse> =>
  request({ url: `/public/v4/otc/requests/${requestId}`, method: 'GET' })

export const OtcService = {
  getPairs,
  getAllUserRequests,
  submitRequest,
  depositFromBalance,
  cancelDeposit,
  acceptOffer,
  rejectOffer,
  getUserRequest,
}
