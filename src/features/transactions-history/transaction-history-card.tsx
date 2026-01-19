import { useEffect, useState } from 'react'
import moment from 'moment'

import { Spinner } from 'components'
import { HistoryResponseError } from 'components/history-response-error'
import { NoHistoryPlaceholder } from 'components/no-history-placeholder'
import { NoResultsFilter } from 'components/no-results-filter'
import { FilterOptionsType } from 'features/modals/transaction-filter'
import { TxnFiltersState, TxnHistoryFiltersPairs } from 'features/txn-history-filters-pairs'
import { getToken } from 'utils'
import { CardHistoryQueryParams } from 'wip/services'
import { ExtendedAccountStatementRecord, getCardHistoryByFilterFx, queryParamsDefault } from 'model/card-history'
import downloadIcon from 'assets/icons/download-icon.svg'

import { TYPE_TXN_HISTORY } from './constants'
import { GroupedSectionListForCard } from './grouped-section-list-for-card'
import styles from './styles.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

const FORMAT_DATE = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'

export function TransactionHistoryCard() {
  const storeToken = getToken()
  const { isMobilePairs } = useCurrentBreakpointPairs()

  const [historyData, setHistoryData] = useState<ExtendedAccountStatementRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [responseError, setResponseError] = useState('')
  const [queryParams, setQueryParams] = useState<CardHistoryQueryParams>(queryParamsDefault)
  const [txnFilters, setTxnFilters] = useState<TxnFiltersState>({
    filterOptions: [],
    filtersData: {
      date: [],
      asset: [],
      type: [],
    },
  })

  const fetchInitialData = async (params = queryParams) => {
    setIsLoading(true)
    setResponseError('')

    if (storeToken) {
      try {
        const response = await getCardHistoryByFilterFx(params)
        response && setHistoryData(response)
      } catch (error) {
        setResponseError('error')
        console.log('ERROR - getCardHistoryByFilterFx')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const filterAndSearch = (filterOptionsData: FilterOptionsType[]) => {
    const newQueryParams = { ...queryParamsDefault }

    let hasTransactionTypeFilter = false
    const activeTransactionTypes: Set<string> = new Set()

    filterOptionsData.forEach(option => {
      const field = option.field.toLowerCase()

      if (field === 'time') {
        const [start, end] = option.value.split(' - ')

        let formattedToDate = moment(end).endOf('day').format(FORMAT_DATE)

        if (moment(formattedToDate).isAfter(moment())) {
          formattedToDate = moment().format(FORMAT_DATE)
        }

        newQueryParams.fromDate = moment(start).startOf('day').format(FORMAT_DATE) || start
        newQueryParams.toDate = formattedToDate || end
      } else if (field === 'asset_type') {
        if (!newQueryParams.merchantCategoryTypes) {
          newQueryParams.merchantCategoryTypes = []
        }
        newQueryParams.merchantCategoryTypes.push(option.value)
      } else if (field === 'transaction_type') {
        hasTransactionTypeFilter = true
        activeTransactionTypes.add(option.value)
      }
    })

    if (hasTransactionTypeFilter) {
      newQueryParams.includeAuthorizations = activeTransactionTypes.has('Card Transaction')
      newQueryParams.includeAccountAdjustments = activeTransactionTypes.has('Top Up')
      newQueryParams.includeFees = activeTransactionTypes.has('Fee')
    } else {
      newQueryParams.includeAuthorizations = true
      newQueryParams.includeAccountAdjustments = true
      newQueryParams.includeFees = true
    }

    setQueryParams(newQueryParams)
    fetchInitialData(newQueryParams)
  }

  useEffect(() => {
    filterAndSearch(txnFilters.filterOptions)
  }, [txnFilters.filterOptions])

  const shouldShowFilters =
    !!historyData?.length || !!txnFilters.filterOptions.length || (isLoading && !txnFilters.filterOptions.length)

  return (
    <div className={styles.containerWrap}>
      {!isMobilePairs && shouldShowFilters ? (
        <div className={styles.filterWrap}>
          <TxnHistoryFiltersPairs
            transactionType={TYPE_TXN_HISTORY.CARD}
            setTxnFilters={setTxnFilters}
            txnFilters={txnFilters}
          />
        </div>
      ) : null}

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.headerTitle}>Card Transactions</div>
          </div>
          <div className={styles.tnxTopBarButtonsWrap}>
            {shouldShowFilters && !isMobilePairs ? (
              <button className={styles.tnxTopBarButton} onClick={() => {}} disabled>
                <div className={styles.tnxTopBarButtonText}>Get Report</div>
                <img className={styles.tnxTopBarButtonIcon} alt='icon' src={downloadIcon} />
              </button>
            ) : null}
          </div>
        </div>

        <div className={styles.horizontalLine} />

        {isMobilePairs && shouldShowFilters ? (
          <div className={styles.filterWrapMobile}>
            <button className={styles.tnxTopBarButton} onClick={() => {}} disabled>
              <img className={styles.tnxTopBarButtonIcon} alt='icon' src={downloadIcon} />
            </button>
            <TxnHistoryFiltersPairs
              transactionType={TYPE_TXN_HISTORY.CARD}
              setTxnFilters={setTxnFilters}
              txnFilters={txnFilters}
            />
          </div>
        ) : null}

        {!isLoading && !responseError && historyData?.length ? (
          <GroupedSectionListForCard data={historyData} queryParams={queryParams} setResponseError={setResponseError} />
        ) : null}

        {isLoading ? (
          <div className={styles.loadingWrap}>
            <Spinner />
          </div>
        ) : null}

        {!isLoading && !responseError && !historyData?.length && !txnFilters.filterOptions.length ? (
          <NoHistoryPlaceholder />
        ) : null}

        {!isLoading && !responseError && !historyData?.length && txnFilters.filterOptions.length ? (
          <NoResultsFilter />
        ) : null}
        {!isLoading && responseError ? <HistoryResponseError /> : null}
      </div>
    </div>
  )
}
