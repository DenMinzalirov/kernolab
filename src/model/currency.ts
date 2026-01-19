import { createEvent, createStore } from 'effector'
import persist from 'effector-localstorage'

export type CurrencyType = 'EUR' | 'USD'
export type LowercaseCurrencyType = Lowercase<CurrencyType>

export const defaultCurrency = {
  EUR: {
    symbol: '€', // € $
    type: 'EUR' as CurrencyType,
  },
  USD: {
    symbol: '$', // € $
    type: 'USD' as CurrencyType,
  },
}

export const $currency = createStore(defaultCurrency.EUR)
export const currencyChangedEv = createEvent<Record<string, string>>()

$currency.on(currencyChangedEv, (s, p) => ({ ...s, ...p }))

persist({ store: $currency, key: '@bb_cefi_web_currency_store' })
