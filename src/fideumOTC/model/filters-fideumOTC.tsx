import { createEffect, createEvent, createStore } from 'effector'

import { OTCStatus } from '../../wip/services/fideumOTC-services/OTC-trade'

export interface FilterState {
  clientUuid?: string
  liquidityProvider?: string
  instrument?: string
  side?: 'BUY' | 'SELL' | ''
  status?: string
  createdAtFrom?: string
  createdAtTo?: string
  sort?: string
  page?: number
  size?: number
}

const now = new Date()
const year = now.getFullYear()
const month = now.getMonth() + 1 // getMonth() возвращает 0-11, поэтому +1

// Начало месяца
const startOfMonth = `${year}-${month.toString().padStart(2, '0')}-01`

// Конец месяца
const lastDay = new Date(year, month, 0).getDate() // 0 день следующего месяца = последний день текущего
const endOfMonth = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`

// Начальное состояние фильтров
export const initialFilters: FilterState = {
  clientUuid: '',
  liquidityProvider: '',
  instrument: '',
  side: '',
  status: OTCStatus.EXECUTED,
  createdAtFrom: startOfMonth,
  createdAtTo: endOfMonth,
  sort: 'createdAt,desc',
  page: 0,
  size: 50,
}

// Стор для хранения фильтров
export const $filters = createStore<FilterState>(initialFilters)

// События для управления глобальными фильтрами
export const filtersChangedEv = createEvent<FilterState>()
export const filtersClearedEv = createEvent()

// Эффекты для обновления глобальных фильтров
$filters.on(filtersChangedEv, (_, newFilters) => newFilters).on(filtersClearedEv, () => initialFilters)

// Дополнительные события для более гибкого управления фильтрами
export const filterFieldChangedEv = createEvent<{ field: keyof FilterState; value: string | number }>()
export const filtersResetEv = createEvent()
export const pageChangedEv = createEvent<number>()

// Обновление отдельных полей фильтра
$filters.on(filterFieldChangedEv, (state, { field, value }) => ({
  ...state,
  [field]: value,
}))

// Обновление страницы
$filters.on(pageChangedEv, (state, page) => ({
  ...state,
  page,
}))

// Сброс фильтров к начальному состоянию
$filters.on(filtersResetEv, () => initialFilters)
