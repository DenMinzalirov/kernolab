import { request } from '../base'

export interface WithdrawalRequestFiat {
  assetId: string
  iban: string
  amount: string
  fee: string
  name: string
}

export interface WithdrawalOfferFiat {
  transactionId: number
  iban: string
  amount: string
  fee: string
}

const createWithdrawalRequest = (data: WithdrawalRequestFiat, token: string): Promise<WithdrawalOfferFiat> =>
  request({
    url: '/public/v4/xanova/fiat/withdraw',
    data,
    token,
  })

const getWithdrawalOffer = (data: WithdrawalRequestFiat): Promise<WithdrawalOfferFiat> =>
  request({
    url: '/public/v4/xanova/fiat/withdraw/offer',
    data,
  })

export const XanovaFiatServices = {
  createWithdrawalRequest,
  getWithdrawalOffer,
}
