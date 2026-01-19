import { useEffect, useState } from 'react'

import { FilterOptionsType } from 'features/modals/transaction-filter'

import { TYPE_TXN_HISTORY } from '../constants'
import { loadTransactions } from './load-txn-history'
import { CryptoAndFiatHistoryTypeNew, StakingUniqueFieldsResponse, UnifiedHistoryTypeForBiz } from './type'

export const useTxnHistory = <T>(transactionType: string, filterOptions: FilterOptionsType[] = []) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [txnCryptoAndFiat, setTxnCryptoAndFiat] = useState<CryptoAndFiatHistoryTypeNew[]>([])
  const [txnStaking, setTxnStaking] = useState<StakingUniqueFieldsResponse[]>([])
  const [txnBiz, setTxnBiz] = useState<UnifiedHistoryTypeForBiz[]>([])
  const [page, setPage] = useState(0)
  const [lastPage, setLastPage] = useState(false)
  const [currentFilterOptions, setCurrentFilterOptions] = useState<FilterOptionsType[]>(filterOptions)

  const resetState = () => {
    setTxnCryptoAndFiat([])
    setTxnBiz([])
    setTxnStaking([])
    setPage(0)
  }

  useEffect(() => {
    if (filterOptions !== currentFilterOptions) {
      setCurrentFilterOptions(filterOptions)
      resetState()
    }
  }, [filterOptions, currentFilterOptions])

  useEffect(() => {
    loadTransactions({
      setLoading: setLoading,
      setError,
      setTxnCryptoAndFiat,
      setTxnStaking,
      setTxnBiz,
      page: page,
      currentFilterOptions,
      transactionType,
      setLastPage,
    })
  }, [loadTransactions, currentFilterOptions, page, transactionType])

  const loadMore = () => {
    if (!lastPage && !loading) {
      setPage(prevPage => prevPage + 1)
    }
  }

  const refreshData = () => {
    loadTransactions({
      setLoading: setLoading,
      setError,
      setTxnCryptoAndFiat,
      setTxnStaking,
      setTxnBiz,
      page: page,
      currentFilterOptions,
      transactionType,
      setLastPage,
    })
  }

  let transactions

  if (transactionType === TYPE_TXN_HISTORY.STAKING) {
    transactions = txnStaking as T
  } else if (transactionType === TYPE_TXN_HISTORY.BIZ) {
    transactions = txnBiz as T
  } else {
    transactions = txnCryptoAndFiat as T
  }

  return { transactions, loading, error, loadMore, refreshData }
}
