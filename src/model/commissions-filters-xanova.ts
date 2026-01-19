import { useCallback, useMemo } from 'react'
import { createEvent, createStore, sample } from 'effector'
import { useUnit } from 'effector-react'

import { Modal } from 'components'
import { toTitleCase } from 'utils/to-title-case'
import { CommissionStatus, CommissionType } from 'wip/services'

import { FilterXanovaConfig } from 'xanova/components/filter-xanova'

export type CommissionsFiltersXanova = {
  commissionStatus_in: CommissionStatus[]
  commissionType_in: CommissionType[]
  createdAt_from: string | null
  createdAt_to: string | null
  search: string
  page: number
  size: number
}

export const initialCommissionsFiltersXanova: CommissionsFiltersXanova = {
  commissionStatus_in: [],
  commissionType_in: [],
  createdAt_from: null,
  createdAt_to: null,
  search: '',
  page: 1,
  size: 10,
}

const commissionStatuses = Object.values<CommissionStatus>(CommissionStatus)
const commissionTypes = Object.values<CommissionType>(CommissionType)

const statusOptions = commissionStatuses.map(status => ({
  id: `status-${status.toLowerCase()}`,
  label: toTitleCase(status),
  value: status,
}))

const typeOptions = commissionTypes.map(type => ({
  id: `type-${type.toLowerCase()}`,
  label: toTitleCase(type),
  value: type,
}))

const arraysEqual = <T>(left: readonly T[], right: readonly T[]) => {
  if (left === right) return true
  if (left.length !== right.length) return false
  return left.every((value, index) => value === right[index])
}

const filtersEqual = (left: CommissionsFiltersXanova, right: CommissionsFiltersXanova) => {
  return (
    arraysEqual(left.commissionStatus_in, right.commissionStatus_in) &&
    arraysEqual(left.commissionType_in, right.commissionType_in) &&
    left.createdAt_from === right.createdAt_from &&
    left.createdAt_to === right.createdAt_to &&
    left.search === right.search &&
    left.page === right.page &&
    left.size === right.size
  )
}

const normalizePatch = (
  state: CommissionsFiltersXanova,
  patch: Partial<CommissionsFiltersXanova>
): CommissionsFiltersXanova => {
  const next: CommissionsFiltersXanova = {
    ...state,
    ...patch,
    commissionStatus_in:
      patch.commissionStatus_in !== undefined ? [...patch.commissionStatus_in] : [...state.commissionStatus_in],
    commissionType_in:
      patch.commissionType_in !== undefined ? [...patch.commissionType_in] : [...state.commissionType_in],
    createdAt_from: patch.createdAt_from !== undefined ? (patch.createdAt_from ?? null) : state.createdAt_from,
    createdAt_to: patch.createdAt_to !== undefined ? (patch.createdAt_to ?? null) : state.createdAt_to,
    search: patch.search !== undefined ? patch.search : state.search,
    page: patch.page !== undefined ? Math.max(1, patch.page) : state.page,
    size: patch.size !== undefined && patch.size > 0 ? patch.size : state.size,
  }

  return next
}

const applyPatch = (state: CommissionsFiltersXanova, patch: Partial<CommissionsFiltersXanova>) => {
  const next = normalizePatch(state, patch)
  return filtersEqual(state, next) ? state : next
}

export const $commissionsFiltersXanova = createStore<CommissionsFiltersXanova>(initialCommissionsFiltersXanova)

export const setCommissionsFiltersXanova = createEvent<Partial<CommissionsFiltersXanova>>()
export const resetCommissionsFiltersXanova = createEvent()
export const setCommissionsSearchXanova = createEvent<string>()
export const setCommissionsPageXanova = createEvent<number>()
export const setCommissionsPageSizeXanova = createEvent<number>()
export const applyCommissionsFiltersXanova = createEvent<Record<string, string[]>>()
export const syncCommissionsPaginationXanova = createEvent<{ page?: number; size?: number }>()
export const requestCommissionsXanova = createEvent()

$commissionsFiltersXanova
  .on(setCommissionsFiltersXanova, (state, patch) => applyPatch(state, patch))
  .on(resetCommissionsFiltersXanova, () => initialCommissionsFiltersXanova)
  .on(setCommissionsSearchXanova, (state, query) => {
    const trimmed = query.trim()
    return applyPatch(state, { search: trimmed, page: 1 })
  })
  .on(setCommissionsPageXanova, (state, page) => applyPatch(state, { page }))
  .on(setCommissionsPageSizeXanova, (state, size) => applyPatch(state, { size, page: 1 }))
  .on(syncCommissionsPaginationXanova, (state, payload) => {
    const patch: Partial<CommissionsFiltersXanova> = {}

    if (payload.page !== undefined) {
      patch.page = payload.page
    }

    if (payload.size !== undefined) {
      patch.size = payload.size
    }

    if (Object.keys(patch).length === 0) {
      return state
    }

    return applyPatch(state, patch)
  })

sample({
  clock: applyCommissionsFiltersXanova,
  fn: values => {
    const statuses = (values.status ?? []).filter((status): status is CommissionStatus =>
      commissionStatuses.includes(status as CommissionStatus)
    )
    const types = (values.type ?? []).filter((type): type is CommissionType =>
      commissionTypes.includes(type as CommissionType)
    )

    const patch: Partial<CommissionsFiltersXanova> = {
      commissionStatus_in: statuses,
      commissionType_in: types,
      page: 1,
    }

    if (Object.prototype.hasOwnProperty.call(values, 'date-range')) {
      const [from = '', to = ''] = values['date-range'] ?? []
      patch.createdAt_from = from || null
      patch.createdAt_to = to || null
    }

    return patch
  },
  target: setCommissionsFiltersXanova,
})

type UseCommissionsFilterConfigOptions = {
  onApplied?: () => void
}

export const useCommissionsFilterConfig = (options?: UseCommissionsFilterConfigOptions) => {
  const [filters, applyFilters, resetFilter] = useUnit([
    $commissionsFiltersXanova,
    applyCommissionsFiltersXanova,
    resetCommissionsFiltersXanova,
  ])
  const onApplied = options?.onApplied

  const handleApply = useCallback(
    (values: Record<string, string[]>) => {
      applyFilters(values)
      onApplied?.()
    },
    [applyFilters, onApplied]
  )

  const handleClear = () => {
    resetFilter()
    Modal.close()
  }

  return useMemo<FilterXanovaConfig>(
    () => ({
      title: 'Apply Filters',
      sections: [
        {
          id: 'status',
          title: 'Status',
          type: 'checkbox',
          options: statusOptions.map(option => ({
            ...option,
            checked: filters.commissionStatus_in.includes(option.value),
          })),
        },
        {
          id: 'type',
          title: 'Type',
          type: 'checkbox',
          options: typeOptions.map(option => ({
            ...option,
            checked: filters.commissionType_in.includes(option.value),
          })),
        },
        {
          id: 'date-range',
          title: 'Date Range',
          type: 'date',
          placeholder: 'DD/MM/YYYY',
          value: {
            from: filters.createdAt_from,
            to: filters.createdAt_to,
          },
        },
      ],
      applyLabel: 'Apply',
      onApply: handleApply,
      onClear: handleClear,
    }),
    [filters.commissionStatus_in, filters.commissionType_in, filters.createdAt_from, filters.createdAt_to, handleApply]
  )
}

export const handleFiltersApply = applyCommissionsFiltersXanova
