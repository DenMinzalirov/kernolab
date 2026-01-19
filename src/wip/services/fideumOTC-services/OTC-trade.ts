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

export enum OTCStatus {
  CREATED = 'CREATED',
  EXECUTED = 'EXECUTED',
  FAILED = 'FAILED',
}

export enum OTCClientStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

export interface OTCTrade {
  tradeUuid: string
  status: OTCStatus
  clientUuid: string
  liquidityProvider: string
  instrument: string
  currency: string
  side: 'BUY' | 'SELL'
  amount: string
  expectedExecutionPrice: string
  slippagePercent: string
  executedPrice: string
  markup: string
  clientLeftAmount: string
  clientRightAmount: string
  baseCurrencyToEurRate: string
  counterCurrencyToEurRate: string
  createdAt: string
  updatedAt: string
}

export interface OTCTradeCreateRequest {
  clientUuid: string
  liquidityProvider: string
  instrument: string
  currency: string
  side: 'BUY' | 'SELL'
  amount: string
  expectedExecutionPrice: string
  markup: string
  clientLeftAmount: string
  clientRightAmount: string
}

export interface OTCTradeEditClientRequest {
  clientUuid: string
}

export interface OTCTradeEditClientPriceRequest {
  clientLeftAmount: string
  clientRightAmount: string
}

export interface OTCClient {
  clientUuid: string
  applicantId: string
  status: OTCClientStatus
  email: string
  fullName: string
  createdAt: string
  updatedAt: string
}

export interface PageOTCTrade {
  totalElements: number
  totalPages: number
  size: number
  content: OTCTrade[]
  number: number
  sort: SortObject
  first: boolean
  last: boolean
  numberOfElements: number
  pageable: PageableObject
  empty: boolean
}

export interface PageOTCClient {
  totalElements: number
  totalPages: number
  size: number
  content: OTCClient[]
  number: number
  sort: SortObject
  first: boolean
  last: boolean
  numberOfElements: number
  pageable: PageableObject
  empty: boolean
}

// Query parameters for filtering OTC trades
export interface OTCTradeQueryParams {
  // Amount filters
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

  // Base currency to EUR rate filters
  baseCurrencyToEurRate_eq?: string
  baseCurrencyToEurRate_ne?: string
  baseCurrencyToEurRate_gt?: string
  baseCurrencyToEurRate_lt?: string
  baseCurrencyToEurRate_ge?: string
  baseCurrencyToEurRate_le?: string
  baseCurrencyToEurRate_in?: string[]
  baseCurrencyToEurRate_not?: string[]
  baseCurrencyToEurRate_from?: string
  baseCurrencyToEurRate_to?: string

  // Client UUID filters
  clientUuid_eq?: string
  clientUuid_ne?: string

  // Created date filters
  createdAt_gt?: string
  createdAt_lt?: string
  createdAt_ge?: string
  createdAt_le?: string
  createdAt_from?: string
  createdAt_to?: string

  // Executed price filters
  executedPrice_eq?: string
  executedPrice_ne?: string
  executedPrice_gt?: string
  executedPrice_lt?: string
  executedPrice_ge?: string
  executedPrice_le?: string
  executedPrice_in?: string[]
  executedPrice_not?: string[]
  executedPrice_from?: string
  executedPrice_to?: string

  // Expected execution price filters
  expectedExecutionPrice_eq?: string
  expectedExecutionPrice_ne?: string
  expectedExecutionPrice_gt?: string
  expectedExecutionPrice_lt?: string
  expectedExecutionPrice_ge?: string
  expectedExecutionPrice_le?: string
  expectedExecutionPrice_in?: string[]
  expectedExecutionPrice_not?: string[]
  expectedExecutionPrice_from?: string
  expectedExecutionPrice_to?: string

  // Client left amount filters
  clientLeftAmount_eq?: string
  clientLeftAmount_ne?: string
  clientLeftAmount_gt?: string
  clientLeftAmount_lt?: string
  clientLeftAmount_ge?: string
  clientLeftAmount_le?: string
  clientLeftAmount_in?: string[]
  clientLeftAmount_not?: string[]
  clientLeftAmount_from?: string
  clientLeftAmount_to?: string

  // Client right amount filters
  clientRightAmount_eq?: string
  clientRightAmount_ne?: string
  clientRightAmount_gt?: string
  clientRightAmount_lt?: string
  clientRightAmount_ge?: string
  clientRightAmount_le?: string
  clientRightAmount_in?: string[]
  clientRightAmount_not?: string[]
  clientRightAmount_from?: string
  clientRightAmount_to?: string

  // Counter currency to EUR rate filters
  counterCurrencyToEurRate_eq?: string
  counterCurrencyToEurRate_ne?: string
  counterCurrencyToEurRate_gt?: string
  counterCurrencyToEurRate_lt?: string
  counterCurrencyToEurRate_ge?: string
  counterCurrencyToEurRate_le?: string
  counterCurrencyToEurRate_in?: string[]
  counterCurrencyToEurRate_not?: string[]
  counterCurrencyToEurRate_from?: string
  counterCurrencyToEurRate_to?: string

  // Currency filters
  currency_eq?: string
  currency_ne?: string
  currency_like?: string
  currency_ilike?: string
  currency_in?: string[]
  currency_not?: string[]

  // Instrument filters
  instrument_eq?: string
  instrument_ne?: string
  instrument_like?: string
  instrument_ilike?: string
  instrument_in?: string[]
  instrument_not?: string[]

  // Liquidity provider filters
  liquidityProvider_eq?: string
  liquidityProvider_ne?: string
  liquidityProvider_like?: string
  liquidityProvider_ilike?: string
  liquidityProvider_in?: string[]
  liquidityProvider_not?: string[]

  // Markup filters
  markup_eq?: string
  markup_ne?: string
  markup_gt?: string
  markup_lt?: string
  markup_ge?: string
  markup_le?: string
  markup_in?: string[]
  markup_not?: string[]
  markup_from?: string
  markup_to?: string

  // Side filters
  side_eq?: 'BUY' | 'SELL'
  side_ne?: 'BUY' | 'SELL'
  side_in?: ('BUY' | 'SELL')[]
  side_not?: ('BUY' | 'SELL')[]

  // Slippage percent filters
  slippagePercent_eq?: string
  slippagePercent_ne?: string
  slippagePercent_gt?: string
  slippagePercent_lt?: string
  slippagePercent_ge?: string
  slippagePercent_le?: string
  slippagePercent_in?: string[]
  slippagePercent_not?: string[]
  slippagePercent_from?: string
  slippagePercent_to?: string

  // Status filters
  status_eq?: OTCStatus
  status_ne?: OTCStatus
  status_in?: OTCStatus[]
  status_not?: OTCStatus[]

  // Trade UUID filters
  tradeUuid_eq?: string
  tradeUuid_ne?: string

  // Updated date filters
  updatedAt_gt?: string
  updatedAt_lt?: string
  updatedAt_ge?: string
  updatedAt_le?: string
  updatedAt_from?: string
  updatedAt_to?: string

  // Pagination
  page?: number
  size?: number
  sort?: string
}

// Query parameters for filtering OTC clients
export interface OTCClientQueryParams {
  // Applicant ID filters
  applicantId_eq?: string
  applicantId_ne?: string
  applicantId_like?: string
  applicantId_ilike?: string
  applicantId_in?: string[]
  applicantId_not?: string[]

  // Client UUID filters
  clientUuid_eq?: string
  clientUuid_ne?: string

  // Created date filters
  createdAt_gt?: string
  createdAt_lt?: string
  createdAt_ge?: string
  createdAt_le?: string
  createdAt_from?: string
  createdAt_to?: string

  // Email filters
  email_eq?: string
  email_ne?: string
  email_like?: string
  email_ilike?: string
  email_in?: string[]
  email_not?: string[]

  // Full name filters
  fullName_eq?: string
  fullName_ne?: string
  fullName_like?: string
  fullName_ilike?: string
  fullName_in?: string[]
  fullName_not?: string[]

  // Status filters
  status_eq?: OTCClientStatus
  status_ne?: OTCClientStatus
  status_in?: OTCClientStatus[]
  status_not?: OTCClientStatus[]

  // Updated date filters
  updatedAt_gt?: string
  updatedAt_lt?: string
  updatedAt_ge?: string
  updatedAt_le?: string
  updatedAt_from?: string
  updatedAt_to?: string

  // Pagination
  page?: number
  size?: number
  sort?: string
}

// Get OTC trades with optional query parameters
const getOTCTrades = (params?: OTCTradeQueryParams): Promise<PageOTCTrade> =>
  request({
    url: '/public/otc/trade/',
    method: 'GET',
    data: params,
  })

// Get OTC clients with optional query parameters
const getOTCClients = (params?: OTCClientQueryParams): Promise<PageOTCClient> =>
  request({
    url: '/public/otc/client/',
    method: 'GET',
    data: params,
  })

// Get available liquidity providers
const getLiquidityProviders = (): Promise<string[]> =>
  request({
    url: '/public/otc/trade/liquidity-providers',
    method: 'GET',
  })

// Get slippage percent
const getSlippagePercent = (): Promise<string> =>
  request({
    url: '/public/otc/trade/slippage-percent',
    method: 'GET',
  })

// Execute OTC trade (create and execute)
const executeOTCTrade = (data: OTCTradeCreateRequest): Promise<OTCTrade> =>
  request({
    url: '/public/otc/trade/execute',
    method: 'POST',
    data,
  })

// Edit client for OTC trade request
const editClientOTCTradeRequest = (tradeUuid: string, data: OTCTradeEditClientRequest): Promise<OTCTrade> =>
  request({
    url: `/public/otc/trade/${tradeUuid}/edit-client`,
    method: 'POST',
    data,
  })

// Edit client amounts for OTC trade request
const editClientAmountsOTCTradeRequest = (tradeUuid: string, data: OTCTradeEditClientPriceRequest): Promise<OTCTrade> =>
  request({
    url: `/public/otc/trade/${tradeUuid}/edit-client-amounts`,
    method: 'POST',
    data,
  })

export interface B2C2CombinedInstrumentResponse {
  name: string
  b2c2Name: string
  leftMinimumAmount: string
  leftMaximumAmount: string
  rightMinimumAmount: string
  rightMaximumAmount: string
  quantityPrecision: string
  priceSignificantDigits: number
}

// Comment interfaces
export interface OTCTradeComment {
  tradeUuid: string
  comment: string
  createdAt: string
  updatedAt: string
}

export interface OTCClientComment {
  clientUuid: string
  comment: string
  createdAt: string
  updatedAt: string
}

export interface AddCommentRequest {
  comment: string
}

// Trade Log interfaces
export enum OTCTradeLogType {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  EDIT_CLIENT = 'EDIT_CLIENT',
  EDIT_CLIENT_PRICE = 'EDIT_CLIENT_PRICE',
  PREVIEW = 'PREVIEW',
  FINALIZE = 'FINALIZE',
  EXECUTE = 'EXECUTE',
  FAIL = 'FAIL',
}

export interface OTCTradeLog {
  id: number
  tradeUuid: string
  type: OTCTradeLogType
  log: string
  createdAt: string
  updatedAt: string
}

export interface PageOTCTradeLog {
  totalElements: number
  totalPages: number
  size: number
  content: OTCTradeLog[]
  number: number
  sort: SortObject
  first: boolean
  last: boolean
  numberOfElements: number
  pageable: PageableObject
  empty: boolean
}

// Trade Log Query Parameters
export interface OTCTradeLogQueryParams {
  // ID filters
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

  // Log filters
  log_eq?: string
  log_ne?: string
  log_like?: string
  log_ilike?: string
  log_in?: string[]
  log_not?: string[]

  // Trade UUID filters
  tradeUuid_eq?: string
  tradeUuid_ne?: string

  // Type filters
  type_eq?: OTCTradeLogType
  type_ne?: OTCTradeLogType
  type_in?: OTCTradeLogType[]
  type_not?: OTCTradeLogType[]

  // Created date filters
  createdAt_gt?: string
  createdAt_lt?: string
  createdAt_ge?: string
  createdAt_le?: string
  createdAt_from?: string
  createdAt_to?: string

  // Updated date filters
  updatedAt_gt?: string
  updatedAt_lt?: string
  updatedAt_ge?: string
  updatedAt_le?: string
  updatedAt_from?: string
  updatedAt_to?: string

  // Pagination
  page?: number
  size?: number
  sort?: string[]
}

// Get B2C2 instruments
const getB2C2Instruments = (): Promise<B2C2CombinedInstrumentResponse[]> =>
  request({
    url: '/public/b2c2/instruments',
    method: 'POST',
  })

// Get B2C2 price
export interface B2C2PriceRequest {
  name: string
  currency: string
  side: 'BUY' | 'SELL'
  amount: string
}

export interface B2C2PriceResponse {
  name: string
  currency: string
  side: 'BUY' | 'SELL'
  amount: string
  rate: string
}

const getB2C2Price = (data: B2C2PriceRequest): Promise<B2C2PriceResponse> =>
  request({
    url: '/public/b2c2/price',
    method: 'POST',
    data,
  })

// Comment functions
const getTradeComment = (tradeUuid: string): Promise<OTCTradeComment> =>
  request({
    url: `/public/otc/trade/${tradeUuid}/comment`,
    method: 'GET',
  })

const saveTradeComment = (tradeUuid: string, data: AddCommentRequest): Promise<void> =>
  request({
    url: `/public/otc/trade/${tradeUuid}/comment`,
    method: 'POST',
    data,
  })

const getClientComment = (clientUuid: string): Promise<OTCClientComment> =>
  request({
    url: `/public/otc/client/${clientUuid}/comment`,
    method: 'GET',
  })

const saveClientComment = (clientUuid: string, data: AddCommentRequest): Promise<void> =>
  request({
    url: `/public/otc/client/${clientUuid}/comment`,
    method: 'POST',
    data,
  })

// Trade Log functions
const getOTCTradeLogs = (params?: OTCTradeLogQueryParams): Promise<PageOTCTradeLog> =>
  request({
    url: '/public/otc/trade/logs',
    method: 'GET',
    data: params,
  })

export const OTCTradeServices = {
  getOTCTrades,
  getOTCClients,
  getLiquidityProviders,
  getSlippagePercent,
  executeOTCTrade,
  editClientOTCTradeRequest,
  editClientAmountsOTCTradeRequest,
  getB2C2Instruments,
  getB2C2Price,
  // Comment services
  getTradeComment,
  saveTradeComment,
  getClientComment,
  saveClientComment,
  // Log services
  getOTCTradeLogs,
}
