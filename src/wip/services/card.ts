import { request } from './base'
export enum ECardStatus {
  ACTIVE = 'ACTIVE',
  AWAITING_RENEWAL = 'AWAITING_RENEWAL',
  BLOCKED = 'BLOCKED',
  CLOSED = 'CLOSED',
  CLOSING = 'CLOSING',
  CREATED = 'CREATED',
  DISPATCHED = 'DISPATCHED',
  EXPIRED = 'EXPIRED',
  ORDERED = 'ORDERED',
  PERSONALIZED = 'PERSONALIZED',
}

export enum ECardBlockType {
  BLOCKED_BY_CARD_USER = 'BLOCKED_BY_CARD_USER',
  BLOCKED_BY_CARDHOLDER = 'BLOCKED_BY_CARDHOLDER',
  BLOCKED_BY_CARDHOLDER_VIA_PHONE = 'BLOCKED_BY_CARDHOLDER_VIA_PHONE',
  BLOCKED_BY_CLIENT = 'BLOCKED_BY_CLIENT',
  BLOCKED_BY_ISSUER = 'BLOCKED_BY_ISSUER',
  COUNTERFEIT = 'COUNTERFEIT',
  FRAUDULENT = 'FRAUDULENT',
  FROZEN = 'FROZEN',
  LOST = 'LOST',
  MAX_INVALID_TRIES_CVV_2 = 'MAX_INVALID_TRIES_CVV_2',
  MAX_INVALID_TRIES_PIN = 'MAX_INVALID_TRIES_PIN',
  NOT_DELIVERED = 'NOT_DELIVERED',
  STOLEN = 'STOLEN',
}

export enum ECardType {
  CHIP_AND_PIN = 'CHIP_AND_PIN',
  CHIP_AND_PIN_ANONYMOUS = 'CHIP_AND_PIN_ANONYMOUS',
  VIRTUAL = 'VIRTUAL',
}

export enum EDispatchMethod {
  DHL_EXPRESS = 'DHL_EXPRESS',
  DHL_GLOBAL_MAIL = 'DHL_GLOBAL_MAIL',
  DHL_GLOBAL_MAIL_TRACKED = 'DHL_GLOBAL_MAIL_TRACKED',
  DPD_EXPRESS = 'DPD_EXPRESS',
  STANDARD_LATVIAN_POST_MAIL = 'STANDARD_LATVIAN_POST_MAIL',
}

export type CardSecurity = {
  contactlessEnabled: boolean
  withdrawalEnabled: boolean
  internetPurchaseEnabled: boolean
  overallLimitsEnabled: boolean
}

export type CardLimitsWithUsage = {
  dailyContactlessPurchaseAvailable: string
  dailyContactlessPurchaseUsed: string
  dailyInternetPurchaseAvailable: string
  dailyInternetPurchaseUsed: string
  dailyOverallPurchaseAvailable: string
  dailyOverallPurchaseUsed: string
  dailyPurchaseAvailable: string
  dailyPurchaseUsed: string
  dailyWithdrawalAvailable: string
  dailyWithdrawalUsed: string
  monthlyContactlessPurchaseAvailable: string
  monthlyContactlessPurchaseUsed: string
  monthlyInternetPurchaseAvailable: string
  monthlyInternetPurchaseUsed: string
  monthlyOverallPurchaseAvailable: string
  monthlyOverallPurchaseUsed: string
  monthlyPurchaseAvailable: string
  monthlyPurchaseUsed: string
  monthlyWithdrawalAvailable: string
  monthlyWithdrawalUsed: string
  weeklyContactlessPurchaseAvailable: string
  weeklyContactlessPurchaseUsed: string
  weeklyInternetPurchaseAvailable: string
  weeklyInternetPurchaseUsed: string
  weeklyOverallPurchaseAvailable: string
  weeklyOverallPurchaseUsed: string
  weeklyPurchaseAvailable: string
  weeklyPurchaseUsed: string
  weeklyWithdrawalAvailable: string
  weeklyWithdrawalUsed: string
}

export type DeliveryAddress = {
  firstName: string
  lastName: string
  companyName: string
  address1: string
  address2: string
  postalCode: string
  city: string
  countryCode: string
  dispatchMethod: EDispatchMethod
  phone: string
  trackingNumber: string
}

export type BasicCardInfo = {
  cardUuid: string
  predecessorCardUuid: string | null
  type: ECardType
  maskedCardNumber: string
  expiryDate: string
  blockType: ECardBlockType | null
  blockedAt: string | null
  blockedBy: string | null
  status: ECardStatus
  limits: CardLimitsWithUsage
  security: CardSecurity
  deliveryAddress: DeliveryAddress | null
  embossingName?: string | null
}

export type UpdateCardSecurityRequest = {
  contactlessEnabled: boolean
  withdrawalEnabled: boolean
  internetPurchaseEnabled: boolean
}

export type OrderStatus = {
  currentStep: string // NONE 'KYC' RESIDENCY
  nextStep: string // 'RESIDENCY'
  additionalInfo: any // Record<string, string>
}

export type BalanceType = {
  amount: string
}

export type EncryptedCardDetailsRequestBody = {
  publicKey: string
  cardUuid: string
  token: string
}

export type EncryptedCardDetails = {
  encryptedCardNumber: string
  encryptedCvv2: string
}

export type EncryptedCard3DPassword = {
  encryptedCard3DPassword: string
}

export type EncryptedCardPin = {
  encryptedCardPin: string
}

export type AccountStatementRecord = {
  id: string
  cardUuid: string
  type: 'ACCOUNT_ADJUSTMENT' | 'AUTHORIZATION' | 'FEE' | 'TRANSACTION'
  group:
    | 'ADDITIONAL_VIRTUAL_CARDS_FEE'
    | 'AUTHORIZATION_ATM_BALANCE_INQUIRY_FIXED_FEE'
    | 'AUTHORIZATION_ATM_DECLINED_FIXED_FEE'
    | 'AUTHORIZATION_ATM_WITHDRAWAL_COMPLEX_FEE'
    | 'AUTHORIZATION_ATM_WITHDRAWAL_EEA_COMPLEX_FEE'
    | 'AUTHORIZATION_ATM_WITHDRAWAL_FIXED_FEE'
    | 'AUTHORIZATION_ATM_WITHDRAWAL_INTERNATIONAL_COMPLEX_FEE'
    | 'AUTHORIZATION_ATM_WITHDRAWAL_PERCENTAGE_FEE'
    | 'AUTHORIZATION_DECLINED_FIXED_FEE'
    | 'AUTHORIZATION_EEA_FIXED_FEE'
    | 'AUTHORIZATION_FIXED_FEE'
    | 'AUTHORIZATION_FOREIGN_EXCHANGE_PERCENTAGE_FEE'
    | 'AUTHORIZATION_INTERNATIONAL_FIXED_FEE'
    | 'CARD_ISSUANCE_FIXED_FEE'
    | 'CARD_REPLACEMENT_FIXED_FEE'
    | 'CARD_USAGE_FIXED_FEE'
    | 'DEPOSIT'
    | 'INTERNET_PURCHASE'
    | 'OTHER'
    | 'PIN_CHANGE_FIXED_FEE'
    | 'PIN_MANAGEMENT'
    | 'PAYMENT_EEA_COMPLEX_FEE'
    | 'PAYMENT_EEA_FIXED_FEE'
    | 'PAYMENT_INTERNATIONAL_COMPLEX_FEE'
    | 'PAYMENT_INTERNATIONAL_FIXED_FEE'
    | 'PAYMENT_PERCENTAGE_FEE'
    | 'PRICING_PLAN_FEE'
    | 'PURCHASE'
    | 'REFUND'
    | 'WITHDRAW'
  date: string
  transactionAmount: string
  transactionCurrencyCode:
    | 'AED'
    | 'AFN'
    | 'ALL'
    | 'AMD'
    | 'ANG'
    | 'AOA'
    | 'ARS'
    | 'AUD'
    | 'AWG'
    | 'AZN'
    | 'BAM'
    | 'BBD'
    | 'BDT'
    | 'BGN'
    | 'BHD'
    | 'BIF'
    | 'BMD'
    | 'BND'
    | 'BOB'
    | 'BOV'
    | 'BRL'
    | 'BSD'
    | 'BTN'
    | 'BWP'
    | 'BYN'
    | 'BZD'
    | 'CAD'
    | 'CDF'
    | 'CHE'
    | 'CHF'
    | 'CHW'
    | 'CLF'
    | 'CLP'
    | 'CNY'
    | 'COP'
    | 'COU'
    | 'CRC'
    | 'CUC'
    | 'CUP'
    | 'CVE'
    | 'CZK'
    | 'DJF'
    | 'DKK'
    | 'DOP'
    | 'DZD'
    | 'EGP'
    | 'ERN'
    | 'ETB'
    | 'EUR'
    | 'FJD'
    | 'FKP'
    | 'GBP'
    | 'GEL'
    | 'GHS'
    | 'GIP'
    | 'GMD'
    | 'GNF'
    | 'GTQ'
    | 'GYD'
    | 'HKD'
    | 'HNL'
    | 'HRK'
    | 'HTG'
    | 'HUF'
    | 'IDR'
    | 'ILS'
    | 'INR'
    | 'IQD'
    | 'IRR'
    | 'ISK'
    | 'JMD'
    | 'JOD'
    | 'JPY'
    | 'KES'
    | 'KGS'
    | 'KHR'
    | 'KMF'
    | 'KPW'
    | 'KRW'
    | 'KWD'
    | 'KYD'
    | 'KZT'
    | 'LAK'
    | 'LBP'
    | 'LKR'
    | 'LRD'
    | 'LSL'
    | 'LYD'
    | 'MAD'
    | 'MDL'
    | 'MGA'
    | 'MKD'
    | 'MMK'
    | 'MNT'
    | 'MOP'
    | 'MRU'
    | 'MUR'
    | 'MVR'
    | 'MWK'
    | 'MXN'
    | 'MXV'
    | 'MYR'
    | 'MZN'
    | 'NAD'
    | 'NGN'
    | 'NIO'
    | 'NOK'
    | 'NPR'
    | 'NZD'
    | 'OMR'
    | 'PAB'
    | 'PEN'
    | 'PGK'
    | 'PHP'
    | 'PKR'
    | 'PLN'
    | 'PYG'
    | 'QAR'
    | 'RON'
    | 'RSD'
    | 'RUB'
    | 'RWF'
    | 'SAR'
    | 'SBD'
    | 'SCR'
    | 'SDG'
    | 'SEK'
    | 'SGD'
    | 'SHP'
    | 'SLL'
    | 'SOS'
    | 'SRD'
    | 'SSP'
    | 'STN'
    | 'SVC'
    | 'SYP'
    | 'SZL'
    | 'THB'
    | 'TJS'
    | 'TMT'
    | 'TND'
    | 'TOP'
    | 'TRY'
    | 'TTD'
    | 'TWD'
    | 'TZS'
    | 'UAH'
    | 'UGX'
    | 'USD'
    | 'USN'
    | 'UYI'
    | 'UYU'
    | 'UYW'
    | 'UZS'
    | 'VES'
    | 'VND'
    | 'VUV'
    | 'WST'
    | 'XAF'
    | 'XCD'
    | 'XOF'
    | 'XPF'
    | 'YER'
    | 'ZAR'
    | 'ZMW'
    | 'ZWL'
  merchantCategoryCode: string
  merchantId: string
  terminalId: string
  merchantName: string
  merchantCity: string
  merchantCountryCode: string
  description: string
  originalAuthorizationId: string
  isReversal: boolean
  isDeclined: boolean
  isCleared: boolean
  status: 'CANCELED' | 'COMPLETED' | 'PENDING'
  response: 'APPROVED' | 'DECLINED'
  responseCode: string
  maskedCardNumber: string
  purchaseDate: string
  exchangeRate: string
  enrichedMerchantData: {
    name: string
    url: string
    domain: string
    telephoneNumber: string
    iconUrl: string
  }
}

type HistoryPage = {
  records: AccountStatementRecord[]
  cursor: string
}

export type DispatchMethod = {
  method: 'DHL_EXPRESS' | 'DHL_GLOBAL_MAIL' | 'DHL_GLOBAL_MAIL_TRACKED' | 'DPD_EXPRESS' | 'STANDARD_LATVIAN_POST_MAIL'
  description: string
  price: number
}

type DeliveryAddressData = {
  address1: string
  address2: string
  city: string
  countryCode: string
  postalCode: string
}

export type CardDispatchResponse = {
  dispatchMethods: DispatchMethod[]
  deliveryAddress: DeliveryAddressData
}

export type AccountLimitsResponse = {
  dailyInternetPurchase: number
  dailyContactlessPurchase: number
  monthlyInternetPurchase: number
  monthlyContactlessPurchase: number
}

export type CardHistoryQueryParams = {
  fromRecord: number
  recordsCount: number
  fromDate: string | null // ISO 8601 date string
  toDate: string | null // ISO 8601 date string
  includeAuthorizations: boolean
  includeTransactions: boolean
  includeAccountAdjustments: boolean
  includeFees: boolean
  excludeDeclinedAuthorizations: boolean
  excludeReversedAuthorizations: boolean
  excludeClearedAuthorizations: boolean
  excludePendingAuthorizations: boolean
  excludeStatusAuthorizations: boolean
  excludePendingFees: boolean
  excludeClearedFees: boolean
  excludeDeclinedFees: boolean
  mergeFees: boolean
  searchKeyword: string | null
  statuses: string[] | null
  merchantCategoryCodes: string[] | null
  merchantCategoryTypes: string[] | null
  adjustmentType: string | null
}

export type ResidencyData = {
  countryCode: string
}

export type DepositData = {
  amount: string
}

export type AddressData = {
  address1: string
  address2: string
  city: string
  postalCode: string
}

export type TermsData = {
  isRepresentedBySomeoneElse: boolean
  isBeneficialOwner: boolean
  isPoliticallyExposedPerson: boolean
}

export type CardLimitUsageResponse = {
  total: number
  used: number
  available: number
}

export type CardLimitsResponse = {
  dailyPurchase: CardLimitUsageResponse
  dailyWithdrawal: CardLimitUsageResponse
  dailyInternetPurchase: CardLimitUsageResponse
  dailyContactlessPurchase: CardLimitUsageResponse
  dailyOverallPurchase: CardLimitUsageResponse
  weeklyPurchase: CardLimitUsageResponse
  weeklyWithdrawal: CardLimitUsageResponse
  weeklyInternetPurchase: CardLimitUsageResponse
  weeklyContactlessPurchase: CardLimitUsageResponse
  weeklyOverallPurchase: CardLimitUsageResponse
  monthlyPurchase: CardLimitUsageResponse
  monthlyWithdrawal: CardLimitUsageResponse
  monthlyInternetPurchase: CardLimitUsageResponse
  monthlyContactlessPurchase: CardLimitUsageResponse
  monthlyOverallPurchase: CardLimitUsageResponse
  transactionPurchase: number
  transactionWithdrawal: number
  transactionInternetPurchase: number
  transactionContactlessPurchase: number
}

const getOrderStatus = (): Promise<OrderStatus> => request({ url: `/public/v4/cards/order/status`, method: 'GET' })

const getOrderCardSteps = (): Promise<string[]> => request({ url: `/public/v4/cards/order/steps`, method: 'GET' })

const setOrderCardResidency = (data: ResidencyData): Promise<any> =>
  request({ url: `/public/v4/cards/order/residency`, data })

const setOrderCardKYC = (): Promise<any> => request({ url: `/public/v4/cards/order/kyc` })

const setOrderCardDeposit = (data: DepositData): Promise<any> =>
  request({ url: `/public/v4/cards/order/deposit`, data })

const setOrderCardAddress = (data: AddressData): Promise<any> =>
  request({ url: `/public/v4/cards/order/address`, data })

const setOrderCardPhone = (): Promise<any> => request({ url: `/public/v4/cards/order/phone` })

const setOrderCardTerms = (data: TermsData): Promise<any> => request({ url: `/public/v4/cards/order/terms`, data })

const submitOrderStatus = (): Promise<any> => request({ url: `/public/v4/cards/order/submit` })

const getDispatchAddress = (): Promise<DeliveryAddressData> =>
  request({ url: `/public/v4/cards/order/dispatch-address`, method: 'GET' })

const getAllActiveCards = (): Promise<BasicCardInfo[]> => request({ url: `/public/v4/cards`, method: 'GET' })

const getCardBalance = (): Promise<BalanceType> => request({ url: `/public/v4/card/balance`, method: 'GET' })

const topUpCard = (data: any): Promise<any> => request({ url: `/public/v4/card/balance/top-up`, data })

const cardDetails = (data: EncryptedCardDetailsRequestBody): Promise<EncryptedCardDetails> =>
  request({
    url: `/public/v4/cards/${data.cardUuid}/details`,
    data: { publicKey: data.publicKey },
    token: data.token,
  })

const updateSecurity = (data: any): Promise<BasicCardInfo> =>
  request({ url: `/public/v4/cards/${data.cardUuid}/update-card-security`, data: data.securityData })

const blockCard = (cardUuid: string): Promise<BasicCardInfo> => request({ url: `/public/v4/cards/${cardUuid}/block` })

const unBlockCard = (cardUuid: string): Promise<BasicCardInfo> =>
  request({ url: `/public/v4/cards/${cardUuid}/unblock` })

const getCard3DPassword = (data: EncryptedCardDetailsRequestBody): Promise<EncryptedCard3DPassword> =>
  request({
    url: `/public/v4/cards/${data.cardUuid}/3d-password`,
    data: { publicKey: data.publicKey },
    token: data.token,
  })

const getCardPin = (data: EncryptedCardDetailsRequestBody): Promise<EncryptedCardPin> =>
  request({ url: `/public/v4/cards/${data.cardUuid}/pin`, data: { publicKey: data.publicKey }, token: data.token })

const activateCard = (cardUuid: string): Promise<BasicCardInfo> =>
  request({ url: `/public/v4/cards/${cardUuid}/activate` })

const getCardHistory = (): Promise<HistoryPage> =>
  request({ url: `/public/v4/card/balance/transactions`, method: 'GET' })

const getCardHistoryByFilter = (data: CardHistoryQueryParams): Promise<AccountStatementRecord[]> =>
  request({ url: `/public/v4/card/balance/transactions-by-filter`, data })

const setPhysicalCardRequested = (data: string): Promise<any> => request({ url: `/public/v4/cards/physical`, data })

const getDelivery = (code: string): Promise<DispatchMethod[]> =>
  request({ url: `/public/v4/cards/dispatch-methods?countryCode=${code}`, method: 'GET' })

const getCardAccountLimits = (): Promise<AccountLimitsResponse> =>
  request({ url: '/public/v4/cards/account/limits', method: 'GET' })

const getCardLimits = (cardUuid: string): Promise<CardLimitsResponse> =>
  request({ url: `/public/v4/cards/${cardUuid}/limits`, method: 'GET' })

export type CardFeesResponse = {
  type: string
  fixedPart: number
  percentagePart: number
  minAmount: number
}

const getCardFees = (cardUuid: string): Promise<CardFeesResponse[]> =>
  request({ url: `/public/v4/cards/${cardUuid}/fees`, method: 'GET' })

export type FeesInfoResponse = {
  feeType: string
  name: string
  description: string
}

const getFeesInfo = (): Promise<FeesInfoResponse[]> => request({ url: '/public/v4/cards/fees-info', method: 'GET' })

const getCardIssuanceFeeInfo = (
  cardType: 'VIRTUAL' | 'PHYSICAL' | 'CHIPANDPIN',
  cardDeliveryDispatchMethod: EDispatchMethod
): Promise<CardFeesResponse[]> =>
  request({
    url: `/public/v4/cards/issuance-fees?cardType=${cardType}&cardDeliveryDispatchMethod=${cardDeliveryDispatchMethod}`,
    method: 'GET',
  })

export const CardService = {
  getOrderStatus,
  submitOrderStatus,
  getAllActiveCards,
  getCardBalance,
  topUpCard,
  cardDetails,
  updateSecurity,
  blockCard,
  unBlockCard,
  getCard3DPassword,
  getCardPin,
  activateCard,
  getCardHistory,
  setPhysicalCardRequested,
  getDelivery,
  getCardHistoryByFilter,
  getCardAccountLimits,
  getOrderCardSteps,
  setOrderCardResidency,
  setOrderCardKYC,
  setOrderCardDeposit,
  setOrderCardAddress,
  setOrderCardPhone,
  setOrderCardTerms,
  getDispatchAddress,
  getCardLimits,

  getCardFees,
  getFeesInfo,
  getCardIssuanceFeeInfo,
}
