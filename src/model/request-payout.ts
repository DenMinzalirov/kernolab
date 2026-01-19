import { createEvent, createStore } from 'effector'

export type RequestPayoutMethod = 'crypto' | 'bank'

export type RequestPayoutFormValues = {
  amount: string
  assetId: string
  method: RequestPayoutMethod
  iban: string
  beneficiaryName: string
  network: string
  walletAddress: string
}

export const defaultRequestPayoutValues: RequestPayoutFormValues = {
  amount: '',
  assetId: 'USDC',
  method: 'crypto',
  iban: '',
  beneficiaryName: '',
  network: '',
  walletAddress: '',
}

export const requestPayoutFormEv = createEvent<Partial<RequestPayoutFormValues>>()
export const requestPayoutFormResetEv = createEvent()

export const $requestPayoutForm = createStore<RequestPayoutFormValues>(defaultRequestPayoutValues)
  .on(requestPayoutFormEv, (state, patch) => ({ ...state, ...patch }))
  .reset(requestPayoutFormResetEv)
