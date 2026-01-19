import { localStorageKeys } from 'constant'

import { clearAuthTokenEv, setAuthTokenEv } from '../model'

export const getToken = (): string => {
  return localStorage.getItem(localStorageKeys.token) || ''
}

export const saveToken = (token: string): void => {
  localStorage.setItem(localStorageKeys.token, token)
  setAuthTokenEv(token)
}

export const clearToken = (): void => {
  localStorage.removeItem(localStorageKeys.token)
  clearAuthTokenEv()
}

export const getRefreshToken = (): null | string => {
  return localStorage.getItem(localStorageKeys.refreshToken)
}

export const saveRefreshToken = (token: string): void => {
  localStorage.setItem(localStorageKeys.refreshToken, token)
}

export const clearRefreshToken = (): void => {
  localStorage.removeItem(localStorageKeys.refreshToken)
}

export interface BizChart {
  updateTime: string
  pricesChart: number[][]
  assetId: string
}

export const getBizChartUpdate = (): null | BizChart => {
  const item = localStorage.getItem(localStorageKeys.bizChartUpdate)
  return item ? JSON.parse(item) : null
}

export const setBizChartUpdate = (value: BizChart): void => {
  localStorage.setItem(localStorageKeys.bizChartUpdate, JSON.stringify(value))
}

// export const save2faStatus = (status: boolean): void => {
//   const stringStatus = status?.toString() || 'false'
//   localStorage.setItem(localStorageKeys.twoFAStatus, stringStatus)
// }
export interface CashChart {
  timestamp: number
  data: number[][]
}

export const getCashChartUpdate = (): Record<string, CashChart> => {
  const item = localStorage.getItem(localStorageKeys.cashChartUpdate)
  return item ? JSON.parse(item) : {}
}

export const setCashChartUpdate = (value: Record<string, CashChart>): void => {
  localStorage.setItem(localStorageKeys.cashChartUpdate, JSON.stringify(value))
}
