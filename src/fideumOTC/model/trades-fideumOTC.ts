import { createEffect, createEvent, createStore, sample } from 'effector'

import {
  OTCTrade,
  OTCTradeQueryParams,
  OTCTradeServices,
  PageOTCTrade,
} from 'wip/services/fideumOTC-services/OTC-trade'

import { $filters } from './filters-fideumOTC'
import { transformFiltersToQueryParams } from 'fideumOTC/utils/transformFiltersToQueryParams'

export const $tradesOTC = createStore<OTCTrade[]>([])
export const $tradesOTCChangedEv = createEvent<[]>()

// Стор для хранения информации о пагинации
export const $paginationInfo = createStore<{
  currentPage: number
  totalPages: number
  totalElements: number
  size: number
}>({
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  size: 1,
})

// Эффект для загрузки данных с фильтрами
export const tradesOTCDataFx = createEffect(async (params: OTCTradeQueryParams): Promise<PageOTCTrade> => {
  const data = await OTCTradeServices.getOTCTrades(params)
  return data
})

// Событие для принудительного обновления данных (без параметров)
export const refreshTradesEv = createEvent()

// Событие для обновления с кастомными параметрами (если нужно)
export const refreshTradesWithParamsEv = createEvent<OTCTradeQueryParams>()

// Автоматически применяем фильтры при их изменении или при принудительном обновлении
sample({
  clock: [$filters, refreshTradesEv],
  source: $filters,
  fn: transformFiltersToQueryParams,
  target: tradesOTCDataFx,
})

// Обработка обновления с кастомными параметрами
sample({
  clock: refreshTradesWithParamsEv,
  target: tradesOTCDataFx,
})

// Обновляем данные трейдов и информацию о пагинации
$tradesOTC.on(tradesOTCDataFx.doneData, (_, pageData) => pageData.content)
$tradesOTC.on($tradesOTCChangedEv, (s, p) => p)

// Обновляем информацию о пагинации
$paginationInfo.on(tradesOTCDataFx.doneData, (_, pageData) => ({
  currentPage: pageData.number,
  totalPages: pageData.totalPages,
  totalElements: pageData.totalElements,
  size: pageData.size,
}))

// Удобные функции для использования в компонентах
export const refreshTrades = () => refreshTradesEv()
export const refreshTradesWithCustomParams = (params: OTCTradeQueryParams) => refreshTradesWithParamsEv(params)

// Функция для получения текущих параметров запроса (может быть полезна для отладки)
export const getCurrentQueryParams = () => transformFiltersToQueryParams($filters.getState())
