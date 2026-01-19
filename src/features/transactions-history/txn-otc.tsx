import { useCallback, useEffect, useRef, useState } from 'react'
import { useUnit } from 'effector-react'
import moment from 'moment'
import clsx from 'clsx'

import { Modal, Spinner } from 'components'
import { HistoryResponseError } from 'components/history-response-error'
import { NoHistoryOtc } from 'components/no-history-placeholder/no-history-otc'
import { NoResultsFilter } from 'components/no-results-filter'
import { FilterOptionsType, TransactionHistoryFilter } from 'features/modals/transaction-filter'
import { FilterBar } from 'features/modals/transaction-filter/filter-bar'
import { OtcTradeRow } from 'features/otc/otc-trade-row'
import { $pageOTC, getOtcFx } from 'model/otc'
import filterIcon from 'assets/icons/history/filter-icon.svg'

import { TYPE_TXN_HISTORY } from './constants'
import styles from './styles.module.scss'

const FORMAT_DATE = 'YYYY-MM-DDTHH:mm:ss.SSS'

export function TxnOtc() {
  // const loaderTriggerRef = useRef<HTMLDivElement>(null)
  const txnPageOTC = useUnit($pageOTC)

  const [filterOptions, setFilterOptions] = useState<FilterOptionsType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  // const parseFilters = useCallback(() => {
  //   const dateNow = moment().format(FORMAT_DATE)
  //   let fromDate = moment('2020-01-01').format(FORMAT_DATE)
  //   let toDate = dateNow

  //   const assetIds: string[] = []
  //   const operationTypes: string[] /* : OperationType[] */ = []

  //   filterOptions.forEach(({ field, value }) => {
  //     switch (field) {
  //       case 'ASSET_TYPE':
  //         assetIds.push(value)
  //         break
  //       case 'TIME': {
  //         const [from, to] = value.split(' - ')
  //         fromDate = moment(from).startOf('day').format(FORMAT_DATE) || fromDate
  //         let formattedToDate = moment(to).endOf('day').format(FORMAT_DATE)

  //         if (moment(formattedToDate).isAfter(moment())) {
  //           formattedToDate = moment().format(FORMAT_DATE)
  //         }
  //         toDate = formattedToDate || toDate
  //         break
  //       }
  //       /* ['Trade Completed', 'Trade Cancelled', 'Awaiting Deposit', 'Offer Received'] */
  //       /* TODO тут добавить как будет филтроваться по тайпу */
  //       case 'TRANSACTION_TYPE':
  //         switch (value) {
  //           case 'Trade Completed':
  //             operationTypes.push('Trade Completed')
  //             break
  //           case 'Trade Cancelled':
  //             operationTypes.push('Trade Cancelled')
  //             break
  //           case 'Awaiting Deposit':
  //             operationTypes.push('Awaiting Deposit')
  //             break
  //           case 'Offer Received':
  //             operationTypes.push('Offer Received')
  //             break
  //           default:
  //             break
  //         }
  //         break
  //       default:
  //         break
  //     }
  //   })

  //   return { fromDate, toDate, assetIds, operationTypes }
  // }, [filterOptions])

  // useEffect(() => {
  //   console.log('parseFilters', parseFilters())
  //   /* Сюда перенести вызва getAllOtc и вызивать с фильтрами, остольные вызовы getAllOtc убрать  */
  // }, [filterOptions])

  const getAllOtc = async () => {
    setLoading(true)
    try {
      await getOtcFx()
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllOtc()
  }, [])

  // const loadMore = () => {
  //   console.log('loadMore')
  //   if (!txnPageOTC?.last && !loading) {
  //     const data = {
  //       page: (txnPageOTC?.pageable.pageNumber || 0) + 1,
  //       size: txnPageOTC?.size || 1000,
  //     }

  //     getOtcFx(data)
  //   }
  // }
  //
  // useEffect(() => {
  //   const observer = new IntersectionObserver(entries => {
  //     const [entry] = entries

  //     if (entry.isIntersecting && !loading) {
  //       loadMore()
  //     }
  //   })

  //   if (loaderTriggerRef.current) {
  //     observer.observe(loaderTriggerRef.current)
  //   }

  //   return () => {
  //     if (loaderTriggerRef.current) {
  //       observer.unobserve(loaderTriggerRef.current)
  //     }
  //   }
  // }, [loading, loadMore])

  // const handleCancelFilter = (value: string) => {
  //   if (value === 'cancelAllFilter') {
  //     setFilterOptions([])
  //     return
  //   }
  //   const data = filterOptions.filter(option => option.value !== value)

  //   setFilterOptions(data)
  // }

  // const handleOpenFilter = () => {
  //   Modal.open(
  //     <TransactionHistoryFilter
  //       filterOptions={filterOptions}
  //       setFilterOptions={setFilterOptions}
  //       transactionType={TYPE_TXN_HISTORY.OTC}
  //     />,
  //     { title: '', variant: 'right', isFullScreen: true }
  //   )
  // }

  // const iconGroup = () => {
  //   return (
  //     <div className={styles.btnGroupWrap}>
  //       <div className={styles.btnGroupButton} onClick={handleOpenFilter}>
  //         <div className={styles.btnGroupButtonText}>Filters</div>
  //         <img className={styles.btnGroupIcon} alt='icon' src={filterIcon} />
  //       </div>

  //       {/* <div className={styles.btnGroupButton} onClick={handleOpenDownloadReport}>
  //         <div className={styles.btnGroupButtonText}>Get Report</div>
  //         <img className={styles.btnGroupIcon} alt='icon' src={downloadIcon} />
  //       </div> */}
  //     </div>
  //   )
  // }

  return (
    <div className={styles.containerWrap}>
      <div className={clsx(styles.container)}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>{'OTC Transactions'}</div>
          {/* {iconGroup()} */}
        </div>
        <div className={styles.horizontalLine}></div>

        {/* <div style={{ margin: '0 14px' }}>
          <FilterBar filterOptions={filterOptions} handleCancelFilter={handleCancelFilter} />
        </div> */}

        {!error && txnPageOTC?.content?.length ? (
          <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 20, overflow: 'auto' }}>
            {txnPageOTC.content.map(item => {
              return <OtcTradeRow data={item} key={item.id} />
            })}
            {/* 
            <div ref={loaderTriggerRef} className={styles.loaderTrigger}>
              .
            </div> */}
          </div>
        ) : null}

        {loading && (
          <div className={styles.loader}>
            <Spinner />
          </div>
        )}
        {!loading && !error && !filterOptions?.length && !txnPageOTC?.content?.length ? <NoHistoryOtc /> : null}
        {!loading && !error && filterOptions?.length && !txnPageOTC?.content?.length ? <NoResultsFilter /> : null}
        {!loading && error ? <HistoryResponseError /> : null}
      </div>
    </div>
  )
}
