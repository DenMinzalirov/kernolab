import { request } from './base'

export interface EthWalletResponse {
  walletAddress: string
}

export interface UDRecord {
  meta: {
    blockchain: string
    domain: string
    namehash: string
    networkId: number
    owner: string
    registry: string
    resolver: string
    reverse: boolean
    tokenId: string
  }
  records: Record<string, string>
}

export interface SuggestionsDomains {
  name: string
  price: number
}

export interface IFpKeyUd {
  key: string
}

const key = '3f71a8e0-c470-4799-998e-447ae4e1c625'
const baseURL = 'https://resolve.unstoppabledomains.com/'
const secretAPIToken = '597id16x2o1wmaoa8hnvaur05b0vzz0n'
const prodURL = 'https://unstoppabledomains.com/'
export const resellerFreeID = 'blockbankprod'
export const fpUrl = 'https://fp.unstoppabledomains.com'

export const supportedNetworksFree = ['ETH', 'AVAX', 'BNB', 'MATIC']

export const getUnstoppabledomainsAddress = (address: string): any => {
  return request({
    method: 'GET',
    customHeaders: {
      'content-type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    url: `domains/${address}`,
    baseURL,
  })
}

export const walletAddressUD = (): Promise<EthWalletResponse> =>
  request({ url: '/v3/unstoppabledomain/get-wallet', method: 'GET' })

export const getReverseRecordUDAddress = async (walletAddress: string): Promise<UDRecord> => {
  return request({
    method: 'GET',
    customHeaders: {
      'content-type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    url: `reverse/${walletAddress}`,
    baseURL,
  })
}

export const getDomainsSuggestions = async (searchAddress: string): Promise<SuggestionsDomains[]> => {
  return request({
    method: 'GET',
    customHeaders: {
      'content-type': 'application/json',
      Authorization: `Bearer ${secretAPIToken}`,
    },
    url: `api/v2/resellers/${resellerFreeID}/domains/suggestions/free?search=${searchAddress}`,
    baseURL: prodURL,
  })
}

export const getFpKeyUd = async (): Promise<IFpKeyUd> => {
  return request({
    method: 'POST',
    customHeaders: {
      'content-type': 'application/json',
      Authorization: `Bearer ${secretAPIToken}`,
    },
    url: `api/v2/resellers/${resellerFreeID}/security/fingerprintjs/keys`,
    baseURL: prodURL,
  })
}

export const getOrderUd = async (data: any): Promise<any> => {
  return request({
    method: 'POST',
    customHeaders: {
      'content-type': 'application/json',
      Authorization: `Bearer ${secretAPIToken}`,
    },
    url: `api/v2/resellers/${resellerFreeID}/orders/`,
    baseURL: prodURL,
    data,
  })
}
