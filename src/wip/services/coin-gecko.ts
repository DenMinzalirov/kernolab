import { request } from './base'

export interface RangesRequestData {
  assetName: string
  currency: string
  from: number
  to: number
}

const rangeData = async (data: RangesRequestData): Promise<any> => {
  return request({
    baseURL: 'https://api.coingecko.com/api/v3/',
    url: `coins/${data.assetName}/market_chart/range?vs_currency=${data.currency}&from=${data.from}&to=${data.to}`,
    method: 'GET',
  })
}

export const CoingeckoService = {
  rangeData,
}
