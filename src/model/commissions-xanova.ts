import { attach, createEffect, createStore, merge, sample } from 'effector'

import {
  CommissionStatus,
  CommissionType,
  PageTransportCommission,
  XanovaCommissionQueryParams,
  XanovaServices,
} from 'wip/services'

import {
  $commissionsFiltersXanova,
  CommissionsFiltersXanova,
  requestCommissionsXanova,
  resetCommissionsFiltersXanova,
  setCommissionsFiltersXanova,
  setCommissionsPageSizeXanova,
  setCommissionsPageXanova,
  setCommissionsSearchXanova,
} from './commissions-filters-xanova'

const transformFiltersToQueryParams = (filters: CommissionsFiltersXanova): XanovaCommissionQueryParams => {
  const params: XanovaCommissionQueryParams = {
    size: filters.size || 10,
    page: Math.max(0, filters.page - 1),
  }

  // Применяем фильтры только если они не пустые
  if (filters.commissionStatus_in.length > 0) {
    params.commissionStatus_in = filters.commissionStatus_in.join(',') as CommissionStatus
  }

  if (filters.commissionType_in.length > 0) {
    params.commissionType_in = filters.commissionType_in.join(',') as CommissionType
  }

  if (filters.createdAt_from) {
    params.createdAt_from = filters.createdAt_from
  }

  if (filters.createdAt_to) {
    params.createdAt_to = filters.createdAt_to
  }

  return params
}

export const $commissionsXanova = createStore<PageTransportCommission | null>(null)

const rawGetCommissionsXanovaFx = createEffect(async (params?: XanovaCommissionQueryParams) => {
  return await XanovaServices.getXanovaCommissions(params)
})

export const getCommissionsXanovaFx = attach({
  source: $commissionsFiltersXanova,
  effect: rawGetCommissionsXanovaFx,
  mapParams: (params: XanovaCommissionQueryParams | undefined, filters) => {
    const filtersParams = transformFiltersToQueryParams(filters)

    return { ...params, ...filtersParams, sort: 'createdAt,desc' }
  },
})

$commissionsXanova.on(getCommissionsXanovaFx.doneData, (s, p) => p)

const fetchTriggers = merge([
  setCommissionsFiltersXanova,
  setCommissionsSearchXanova,
  setCommissionsPageXanova,
  setCommissionsPageSizeXanova,
  resetCommissionsFiltersXanova,
  requestCommissionsXanova,
])

sample({
  clock: fetchTriggers,
  fn: () => undefined,
  target: getCommissionsXanovaFx,
})
