import { request } from './base'

type UserDeposit = {
  id: number
  sourceAddress: string
  targetAddress: string
  destinationTag: string
  assetId: string
  networkId: string
  amount: string
  blockchainHash: string
  transactionTimestamp: string
  state: string
}
type UserWithdrawal = {
  id: number
  targetAddress: string
  assetId: string
  networkId: string
  amount: string
  fee: string
  blockchainHash: string
  transactionTimestamp: string
  state: string
}

interface UserDepositsResponse {
  deposits: UserDeposit[]
}

type UserWithdrawalsResponse = {
  withdrawals: UserWithdrawal[]
}

const getUserDeposits = (): Promise<UserDepositsResponse> =>
  request({
    url: `/public/v4/crypto/operations/deposits`,
    method: 'GET',
  })

const getUserWithdrawals = (): Promise<UserWithdrawalsResponse> =>
  request({
    url: `/public/v4/crypto/operations/withdrawals`,
    method: 'GET',
  })

export const CryptoOperationServices = {
  getUserDeposits,
  getUserWithdrawals,
}
