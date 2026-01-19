import { OTCStatus, OTCTradeQueryParams } from 'wip/services/fideumOTC-services/OTC-trade'

import { convertDateToDateTime } from '../features-fideumOTC/clients-fideumOTC/utils'
import { FilterState } from 'fideumOTC/model/filters-fideumOTC'

// Функция для преобразования фильтров в параметры запроса
export const transformFiltersToQueryParams = (filters: FilterState): OTCTradeQueryParams => {
  const params: OTCTradeQueryParams = {
    sort: filters.sort || 'createdAt,desc',
    size: filters.size || 50,
    page: filters.page || 0,
  }

  // Применяем фильтры только если они не пустые
  if (filters.clientUuid) {
    params.clientUuid_eq = filters.clientUuid
  }

  if (filters.liquidityProvider) {
    params.liquidityProvider_eq = filters.liquidityProvider
  }

  if (filters.instrument) {
    params.instrument_eq = filters.instrument
  }

  if (filters.side === 'BUY' || filters.side === 'SELL') {
    params.side_eq = filters.side
  }

  if (filters.status) {
    params.status_eq = filters.status as OTCStatus
  }

  if (filters.createdAtFrom) {
    const dataStart = convertDateToDateTime(filters.createdAtFrom, 'start')

    params.createdAt_from = dataStart
  }

  if (filters.createdAtTo) {
    const dataEnd = convertDateToDateTime(filters.createdAtTo, 'end')
    params.createdAt_to = dataEnd
  }

  if (filters.sort) {
    params.sort = filters.sort
  }

  return params
}
