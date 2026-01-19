import { request } from './base'

export interface AssetInfo {
  assetId: string
  symbol: string
  assetName: string
  precision: number
}

export interface UserAsset {
  assetId: string
  availableBalance: number
  reservedBalance: number
  totalBalance: number
}

export enum ECoinType {
  ETH = 'ETH',
  BNB = 'BNB',
  BTC = 'BTC',
  USD = 'USD',
  EUR = 'EUR',
  DOT = 'DOT',
  SOL = 'SOL',
  XRP = 'XRP',
  AVAX = 'AVAX',
  MATIC = 'MATIC',
}

export interface ExchangeRateRaw {
  fromAssetId: string
  toAssetId: string
  data: CoinGeckoData
}

export interface CoinGeckoData {
  id: string
  symbol: string
  name: string
  image: string
  currentPrice: number
  marketCap: number
  marketCapRank: number
  fullyDilutedValuation: number
  totalVolume: number
  high24h: number
  low24h: number
  priceChange24h: number
  priceChangePercentage24h: number
  marketCapChange24h: number
  marketCapChangePercentage_24h: number
  circulatingSupply: number
  totalSupply: number
  maxSupply: number
  ath: number
  athChangePercentage: number
  athDate: string
  atl: number
  atlChangePercentage: number
  atlDate: string
  lastUpdated: string
}

export interface ExchangeRate {
  fromAssetId: string
  toAssetId: string
  rate: number
}

export enum ECoinNetwork {
  ETH = 'Ethereum',
  BNB = 'Binance Smart Chain',
  AVAX = 'Avalanche',
  MATIC = 'Polygon',
  TRX = 'Tron',
}

export enum ECoinTypeNetworks {
  ETH = 'ETH',
  BNB = 'BNB',
  // BTC = 'BTC',
  AVAX = 'AVAX',
  MATIC = 'MATIC',
  TRX = 'TRX',
}

export interface WithdrawalTransactionRequest {
  assetId: string
  networkId: string
  amount: string
  destinationAddress: string
  destinationTag: string
}

export interface WithdrawalOffer {
  assetId: string
  networkId: string
  amount: string
  fee: string
  destinationAddress: string
  destinationTag: string
  addToWhitelist: boolean
}

export interface ExchangeInfo {
  fromAssetId: string
  toAssetId: string
  rate: number
  remainingAmount: number
  totalFeeAmount: number
}

export interface ExchangeRequest {
  amount: number
  from: string
  to: string
}

export interface ExchangeRequestWithInfo {
  amount: number
  info: ExchangeInfo
}

export interface FavouriteRequest {
  assetId: string
  isFavorite: boolean
}

export interface NetworkWithAssetInfo {
  networkId: string
  minimumDepositAmount: string
  minimumWithdrawalAmount: string
  depositAvailable: boolean
  withdrawalAvailable: boolean
  tagsSupported: boolean
}

export interface AssetWithNetworks {
  assetId: string
  networks: NetworkWithAssetInfo[]
}

interface AvailableAssetsResponse {
  assets: AssetWithNetworks[]
}

const getAssetsInfo = (): Promise<AssetInfo[]> => request({ url: '/public/v4/assets/info', method: 'GET' })

const getMyAssets = (): Promise<UserAsset[]> => request({ url: '/public/v4/assets/my', method: 'GET' })

const getAssetsRatesUsdEur = (): Promise<ExchangeRateRaw[]> =>
  request({ url: '/public/v4/assets/coin-gecko-rates-raw', method: 'GET' })

const getRatesList = (): Promise<ExchangeRate[]> => request({ url: '/public/v4/assets/exchange/rates', method: 'GET' })

const withdrawalInfoRequest = (data: WithdrawalTransactionRequest): Promise<WithdrawalOffer> =>
  request({ url: `/public/v4/crypto/withdrawals/request`, data })

const withdrawalAsset = (data: WithdrawalOffer, token: string): Promise<any> =>
  request({ url: `/public/v4/crypto/withdrawals/submit`, data, token })

const withdrawalAssetWhiteList = (data: WithdrawalOffer): Promise<any> =>
  request({ url: `/public/v4/crypto/withdrawals/whitelisted-submit`, data })

const exchangeInfoAsset = (data: ExchangeRequest): Promise<ExchangeInfo> =>
  request({ url: `/public/v4/assets/my/exchange/${data.from}/${data.to}/info`, data: { amount: data.amount } })

const exchangeAsset = (data: ExchangeRequestWithInfo): Promise<ExchangeInfo> =>
  request({
    url: `/public/v4/assets/my/exchange/${data.info.fromAssetId}/${data.info.toAssetId}`,
    data: { amount: data.amount, info: data.info },
  })

const getFavouriteAssets = (): Promise<string[]> => request({ url: `/public/v3/favourite-assets`, method: 'GET' })

const setFavouriteAssetAddRemove = (data: FavouriteRequest): Promise<void> =>
  request({
    url: `/public/v3/favourite-assets/add-or-remove?assetId=${data.assetId}&isFavorite=${data.isFavorite}`,
    method: 'GET',
  })

const getCryptoDepositWithdrawal = (): Promise<AvailableAssetsResponse> =>
  request({
    url: `/public/v4/crypto/assets`,
    method: 'GET',
  })

export const AssetsServices = {
  getAssetsInfo,
  getMyAssets,
  getAssetsRatesUsdEur,
  getRatesList,
  withdrawalInfoRequest,
  withdrawalAsset,
  withdrawalAssetWhiteList,
  exchangeInfoAsset,
  exchangeAsset,
  getFavouriteAssets,
  setFavouriteAssetAddRemove,
  getCryptoDepositWithdrawal,
}
