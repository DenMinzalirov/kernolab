import type { RequestPayoutMethod } from 'model'

export const REQUEST_PAYOUT_METHOD_TABS: Record<'CRYPTO' | 'BANK', RequestPayoutMethod> = {
  CRYPTO: 'crypto',
  BANK: 'bank',
}

export type RequestPayoutMethodOption = {
  assetId: string
  method: RequestPayoutMethod
  label: string
  disabled?: boolean
}

export const REQUEST_PAYOUT_METHODS: RequestPayoutMethodOption[] = [
  { method: REQUEST_PAYOUT_METHOD_TABS.CRYPTO, assetId: 'USDC', label: 'USDC' },
  // { method: REQUEST_PAYOUT_METHOD_TABS.CRYPTO, assetId: 'USDT', label: 'USDT', disabled: false }, // test
  { method: REQUEST_PAYOUT_METHOD_TABS.BANK, assetId: 'bank', label: 'Bank Transfer' },
]

export const DEFAULT_PAYOUT_METHOD_OPTION =
  REQUEST_PAYOUT_METHODS.find(option => option.method === REQUEST_PAYOUT_METHOD_TABS.CRYPTO && !option.disabled) ??
  REQUEST_PAYOUT_METHODS[0]

export const FIAT_ASSET_ID = 'USD'
