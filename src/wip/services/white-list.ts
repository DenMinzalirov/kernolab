import { request } from './base'
import { PageableObject, SortAddress } from './fiat'

export interface WhitelistAddressRequest {
  name: string
  networkId: string
  address: string
  tag: string
}

export interface WhitelistAddressResponse {
  id: string
  name: string
  networkId: string
  address: string
  tag: string
}

export type PageWhitelistAddressResponse = {
  totalPages: number
  totalElements: number
  size: number
  content: WhitelistAddressResponse[]
  number: number
  sort: SortAddress
  numberOfElements: number
  pageable: PageableObject
  first: boolean
  last: boolean
  empty: boolean
}

const addAddressWhitelist = (data: WhitelistAddressRequest, token: string): Promise<WhitelistAddressResponse> =>
  request({ url: '/public/v4/crypto/withdrawals/whitelist/add', data, token })

const updateAddressWhitelist = (
  data: WhitelistAddressRequest,
  id: string,
  token: string
): Promise<WhitelistAddressResponse> =>
  request({ url: `/public/v4/crypto/withdrawals/whitelist/${id}/update`, data, token, method: 'PUT' })

const getAddressWhitelist = (): Promise<PageWhitelistAddressResponse> =>
  request({ url: '/public/v4/crypto/withdrawals/whitelist/me?page=0&size=100&sort=createdAt%2CASC', method: 'GET' })

const deleteAddressWhitelist = (id: string): Promise<WhitelistAddressResponse> =>
  request({ url: `/public/v4/crypto/withdrawals/whitelist/${id}/delete` })

export const WhitListServices = {
  addAddressWhitelist,
  getAddressWhitelist,
  deleteAddressWhitelist,
  updateAddressWhitelist,
}
