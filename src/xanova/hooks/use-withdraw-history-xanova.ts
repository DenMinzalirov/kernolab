import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import moment from 'moment'

import {
  CryptoWithdrawOperationResponse,
  FiatWithdrawOperationResponse,
  OperationType,
  TransactionsNewServices,
  WithdrawOperationResponse,
} from 'wip/services/transactions-new'
import { RequestPayoutMethod } from 'model'

import type { TablePaginationConfig } from 'xanova/components/data-table'

const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
const DEFAULT_FROM_DATE = moment('2020-01-01').startOf('day').format(DATE_FORMAT)

type WithdrawMethod = RequestPayoutMethod

const METHOD_TO_OPERATION: Record<WithdrawMethod, OperationType> = {
  crypto: OperationType.CRYPTO_WITHDRAW,
  bank: OperationType.FIAT_WITHDRAW,
}

const ORDERED_METHODS: WithdrawMethod[] = ['crypto', 'bank']

const getDefaultToDate = () => moment().format(DATE_FORMAT)

export type WithdrawHistoryXanovaFilters = {
  methods: WithdrawMethod[]
  from: string | null
  to: string | null
}

export type WithdrawHistoryXanovaItem = {
  id: number
  userUuid?: string
  operationTime: string
  operationType: OperationType
  method: WithdrawMethod
  amount?: string
  assetId?: string
  fee?: string
  status?: WithdrawOperationResponse['withdrawStatus']
  withdrawType?: WithdrawOperationResponse['withdrawType']
  withdrawDetails?: WithdrawOperationResponse
  cryptoDetails?: CryptoWithdrawOperationResponse
  fiatDetails?: FiatWithdrawOperationResponse
}

export type UseWithdrawHistoryXanovaOptions = {
  pageSize?: number
  initialFilters?: Partial<WithdrawHistoryXanovaFilters>
}

export type UseWithdrawHistoryXanovaResult = {
  items: WithdrawHistoryXanovaItem[]
  loading: boolean
  error: unknown
  filters: WithdrawHistoryXanovaFilters
  setFilters: (
    updater: WithdrawHistoryXanovaFilters | ((current: WithdrawHistoryXanovaFilters) => WithdrawHistoryXanovaFilters)
  ) => void
  updateFilters: (patch: Partial<WithdrawHistoryXanovaFilters>) => void
  applyFilterValues: (values: Record<string, string[]>) => void
  pagination: {
    totalItems: number
    totalPages: number
    page: number
    pageSize: number
    changePage: (page: number) => void
    changePageSize: (size: number) => void
  }
  tablePagination: TablePaginationConfig
  refetch: () => void
}

const resolveFromDate = (value: string | null) => {
  if (!value) {
    return DEFAULT_FROM_DATE
  }

  return moment(value).startOf('day').format(DATE_FORMAT)
}

const resolveToDate = (value: string | null) => {
  const defaultToDate = getDefaultToDate()

  if (!value) {
    return defaultToDate
  }

  const formatted = moment(value).endOf('day').format(DATE_FORMAT)

  return moment(formatted).isAfter(moment()) ? defaultToDate : formatted
}

const normalizeFilters = (filters: WithdrawHistoryXanovaFilters): WithdrawHistoryXanovaFilters => {
  const methodSet = new Set(filters.methods)
  const ordered = ORDERED_METHODS.filter(method => methodSet.has(method))
  const remaining = Array.from(methodSet).filter(method => !ORDERED_METHODS.includes(method))
  return {
    methods: [...ordered, ...remaining],
    from: filters.from ?? null,
    to: filters.to ?? null,
  }
}

const arraysEqual = <T>(left: readonly T[], right: readonly T[]) => {
  if (left.length !== right.length) {
    return false
  }

  return left.every((value, index) => value === right[index])
}

const filtersEqual = (left: WithdrawHistoryXanovaFilters, right: WithdrawHistoryXanovaFilters) => {
  return arraysEqual(left.methods, right.methods) && left.from === right.from && left.to === right.to
}

const resolveOperationTypes = (methods: WithdrawMethod[]) => {
  if (!methods.length) {
    return [OperationType.CRYPTO_WITHDRAW, OperationType.FIAT_WITHDRAW]
  }

  const uniqueMethods = Array.from(new Set(methods))

  return uniqueMethods.map(method => METHOD_TO_OPERATION[method])
}

const normalizeMethodValue = (value: string): WithdrawMethod | null => {
  const prepared = value.trim().toLowerCase()

  if (prepared.includes('crypto')) {
    return 'crypto'
  }

  if (prepared.includes('bank')) {
    return 'bank'
  }

  return null
}

const mapOperationToMethod = (operationType: OperationType): WithdrawMethod => {
  if (operationType === OperationType.FIAT_WITHDRAW) {
    return 'bank'
  }

  return 'crypto'
}

export const useWithdrawHistoryXanova = (options?: UseWithdrawHistoryXanovaOptions): UseWithdrawHistoryXanovaResult => {
  const initialPageSize = options?.pageSize && options.pageSize > 0 ? options.pageSize : 10

  const [items, setItems] = useState<WithdrawHistoryXanovaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const [filters, setFiltersState] = useState<WithdrawHistoryXanovaFilters>(() =>
    normalizeFilters({
      methods: options?.initialFilters?.methods ? [...options.initialFilters.methods] : [],
      from: options?.initialFilters?.from ?? null,
      to: options?.initialFilters?.to ?? null,
    })
  )

  const requestIdRef = useRef(0)

  const changePage = useCallback((nextPage: number) => {
    setPage(nextPage > 0 ? nextPage : 1)
  }, [])

  const changePageSize = useCallback(
    (nextSize: number) => {
      const safeSize = nextSize > 0 ? nextSize : initialPageSize
      setPageSize(safeSize)
      setPage(1)
    },
    [initialPageSize]
  )

  const replaceFilters = useCallback(
    (
      updater: WithdrawHistoryXanovaFilters | ((current: WithdrawHistoryXanovaFilters) => WithdrawHistoryXanovaFilters)
    ) => {
      let hasChanged = false

      setFiltersState(prev => {
        const nextValue =
          typeof updater === 'function'
            ? (updater as (current: WithdrawHistoryXanovaFilters) => WithdrawHistoryXanovaFilters)(prev)
            : updater
        const normalized = normalizeFilters(nextValue)

        if (filtersEqual(prev, normalized)) {
          return prev
        }

        hasChanged = true
        return normalized
      })

      if (hasChanged) {
        setPage(1)
      }
    },
    []
  )

  const updateFilters = useCallback(
    (patch: Partial<WithdrawHistoryXanovaFilters>) => {
      replaceFilters(current => ({
        methods: patch.methods !== undefined ? [...patch.methods] : current.methods,
        from: patch.from !== undefined ? patch.from : current.from,
        to: patch.to !== undefined ? patch.to : current.to,
      }))
    },
    [replaceFilters]
  )

  const applyFilterValues = useCallback(
    (values: Record<string, string[]>) => {
      const methodValues = values.operationTypes ?? values.method ?? values.methods ?? values['method'] ?? []

      const normalizedMethods = methodValues
        .map(normalizeMethodValue)
        .filter((method): method is WithdrawMethod => Boolean(method))

      const [from = '', to = ''] = values['date-range'] ?? values.date ?? []

      updateFilters({
        methods: normalizedMethods,
        from: from || null,
        to: to || null,
      })
    },
    [updateFilters]
  )

  const refetch = useCallback(() => {
    setReloadTrigger(prev => prev + 1)
  }, [])

  useEffect(() => {
    let isActive = true
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    const fetchHistory = async () => {
      setLoading(true)
      setError(null)

      const operationTypes = resolveOperationTypes(filters.methods)
      const fromDate = resolveFromDate(filters.from)
      const toDate = resolveToDate(filters.to)

      try {
        const historyPage = await TransactionsNewServices.getOperationHistory({
          from: fromDate,
          to: toDate,
          assetIds: [],
          operationTypes,
          page: page - 1,
          size: pageSize,
          sort: [{ field: 'operationTime', sort: 'desc' }],
        })

        if (!isActive || requestIdRef.current !== requestId) {
          return
        }

        const totalElements = historyPage.totalElements ?? 0
        const totalPagesValue = historyPage.totalPages ?? 0
        const serverPage = (historyPage.number ?? 0) + 1

        setTotalItems(totalElements)
        setTotalPages(totalPagesValue)

        if (totalPagesValue > 0 && page > totalPagesValue) {
          setPage(totalPagesValue)
          return
        }

        if (totalElements === 0 && page !== 1) {
          setPage(1)
          return
        }

        if (!historyPage.content?.length) {
          setItems([])
          return
        }

        const grouped = historyPage.content.reduce<Record<OperationType, number[]>>(
          (acc, txn) => {
            if (!acc[txn.operationType]) {
              acc[txn.operationType] = []
            }
            acc[txn.operationType].push(txn.id)
            return acc
          },
          {} as Record<OperationType, number[]>
        )

        const cryptoIds = grouped[OperationType.CRYPTO_WITHDRAW] ?? []
        const fiatIds = grouped[OperationType.FIAT_WITHDRAW] ?? []
        const withdrawIds = [...cryptoIds, ...fiatIds]

        const [withdrawHistory, cryptoDetails, fiatDetails] = await Promise.all([
          withdrawIds.length
            ? TransactionsNewServices.getWithdrawHistory(withdrawIds)
            : Promise.resolve([] as WithdrawOperationResponse[]),
          cryptoIds.length
            ? TransactionsNewServices.getCryptoWithdrawHistory(cryptoIds)
            : Promise.resolve([] as CryptoWithdrawOperationResponse[]),
          fiatIds.length
            ? TransactionsNewServices.getFiatWithdrawHistory(fiatIds)
            : Promise.resolve([] as FiatWithdrawOperationResponse[]),
        ])

        if (!isActive || requestIdRef.current !== requestId) {
          return
        }

        const withdrawMap = new Map(withdrawHistory.map(item => [item.id, item]))
        const cryptoMap = new Map(cryptoDetails.map(item => [item.id, item]))
        const fiatMap = new Map(fiatDetails.map(item => [item.id, item]))

        const combined = historyPage.content
          .filter(txn => [OperationType.CRYPTO_WITHDRAW, OperationType.FIAT_WITHDRAW].includes(txn.operationType))
          .map<WithdrawHistoryXanovaItem>(txn => {
            const withdrawDetails = withdrawMap.get(txn.id)
            const cryptoInfo = cryptoMap.get(txn.id)
            const fiatInfo = fiatMap.get(txn.id)
            const method = mapOperationToMethod(txn.operationType)

            return {
              id: txn.id,
              userUuid: txn.userUuid,
              operationTime: txn.operationTime,
              operationType: txn.operationType,
              method,
              amount: withdrawDetails?.amount,
              assetId: withdrawDetails?.assetId,
              fee: withdrawDetails?.fee,
              status: withdrawDetails?.withdrawStatus,
              withdrawType: withdrawDetails?.withdrawType,
              withdrawDetails,
              cryptoDetails: cryptoInfo,
              fiatDetails: fiatInfo,
            }
          })

        setItems(combined)

        if (serverPage !== page && totalElements > 0) {
          setPage(serverPage)
        }
      } catch (err) {
        if (!isActive || requestIdRef.current !== requestId) {
          return
        }
        setError(err)
        setItems([])
      } finally {
        if (isActive && requestIdRef.current === requestId) {
          setLoading(false)
        }
      }
    }

    fetchHistory()

    return () => {
      isActive = false
    }
  }, [filters, page, pageSize, reloadTrigger])

  const pagination = useMemo(
    () => ({
      totalItems,
      totalPages,
      page,
      pageSize,
      changePage,
      changePageSize,
    }),
    [totalItems, totalPages, page, pageSize, changePage, changePageSize]
  )

  const tablePagination = useMemo<TablePaginationConfig>(
    () => ({
      totalItems,
      currentPage: page,
      pageSize,
      onPageChange: changePage,
      onPageSizeChange: changePageSize,
      mode: 'server',
    }),
    [totalItems, page, pageSize, changePage, changePageSize]
  )

  return {
    items,
    loading,
    error,
    filters,
    setFilters: replaceFilters,
    updateFilters,
    applyFilterValues,
    pagination,
    tablePagination,
    refetch,
  }
}
