import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import clsx from 'clsx'

import { Modal, Spinner } from 'components'
import { HistoryResponseError } from 'components/history-response-error'
import { NoHistoryPlaceholder } from 'components/no-history-placeholder'
import { NoResultsFilter } from 'components/no-results-filter'
import { TxnStakingDetail } from 'features/modals/transaction-history-detail/txn-staking-detail'
import { TxnFiltersState, TxnHistoryFiltersPairs } from 'features/txn-history-filters-pairs'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { formatDecimalWithEllipsis } from 'utils/transactions-history/format-decimal-with-ellipsis'
import { getAmountSign } from 'utils/transactions-history/get-amount-sign'
import downloadIcon from 'assets/icons/download-icon.svg'

import { DownloadReportModal } from '../modals/download-report'
import { GREEN_TEXT_STYLES, TYPE_TXN_HISTORY } from './constants'
import { useTxnHistory } from './hooks'
import { StakingUniqueFieldsResponse } from './hooks/type'
import { processAndGroupDataForStaking } from './process-and-group-data-for-staking'
import styles from './styles.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

export function TxnHistoryStaking() {
  const navigate = useNavigate()
  const loaderTriggerRef = useRef<HTMLDivElement>(null)
  const { isMobilePairs } = useCurrentBreakpointPairs()

  const [txnFilters, setTxnFilters] = useState<TxnFiltersState>({
    filterOptions: [],
    filtersData: {
      date: [],
      asset: [],
      type: [],
    },
  })

  const { transactions, loading, error, loadMore } = useTxnHistory<StakingUniqueFieldsResponse[]>(
    TYPE_TXN_HISTORY.STAKING,
    txnFilters.filterOptions
  )

  const handleGoBack = () => {
    navigate(-1)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const [entry] = entries

      if (entry.isIntersecting && !loading) {
        loadMore()
      }
    })

    if (loaderTriggerRef.current) {
      observer.observe(loaderTriggerRef.current)
    }

    return () => {
      if (loaderTriggerRef.current) {
        observer.unobserve(loaderTriggerRef.current)
      }
    }
  }, [loading, loadMore])

  const handleOpenDownloadReport = () => {
    Modal.open(
      <DownloadReportModal transactionType={TYPE_TXN_HISTORY.STAKING} filterOptions={txnFilters.filterOptions} />,
      {
        title: '',
        variant: 'center',
        // isFullScreen: true,
      }
    )
  }

  const currentMonth = moment().format('MMMM YYYY')

  const handelSelectRow = (rowValue: StakingUniqueFieldsResponse) => {
    Modal.open(<TxnStakingDetail data={rowValue} />, { variant: 'center' })
  }

  const renderItem = (item: StakingUniqueFieldsResponse) => {
    const addCommasToAmount = addCommasToDisplayValue(item.increasedByAmount || item.amount || '', 3)
    const amountWithEllipsis = formatDecimalWithEllipsis(addCommasToAmount)

    return (
      <div className={styles.listRow} onClick={() => handelSelectRow(item)}>
        <img className={styles.listIcon} alt='icon' src={item.icon} />
        <div className={styles.listRowTitleWrap}>
          <div className={styles.listRowTitle}>{item.title}</div>
          <div className={styles.listTextDate}>{moment(item.operationTime).format('MMMM DD, YYYY')}</div>
        </div>
        <div className={styles.flexGrow1} />
        <div className={styles.listTextAmountWrap}>
          <div className={styles.positionRelative}>
            <div
              className={clsx(
                styles.listTextAmount,
                GREEN_TEXT_STYLES.includes(item.title || '') && styles.listGreenColor
              )}
            >
              {getAmountSign(item.title)}
              {amountWithEllipsis} {item.assetId}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <div className={styles.listSectionTitle}>{title}</div>
  )

  const sections = isMobilePairs
    ? processAndGroupDataForStaking(transactions as StakingUniqueFieldsResponse[], currentMonth)
    : []

  const sortedTransactions = transactions.slice().sort((a, b) => {
    return new Date(b.operationTime).getTime() - new Date(a.operationTime).getTime()
  })

  const shouldShowFilters =
    !!transactions?.length || !!txnFilters.filterOptions.length || (loading && !txnFilters.filterOptions.length)

  return (
    <div className={styles.containerWrap}>
      {!isMobilePairs && shouldShowFilters ? (
        <div className={styles.filterWrap}>
          <TxnHistoryFiltersPairs
            transactionType={TYPE_TXN_HISTORY.STAKING}
            setTxnFilters={setTxnFilters}
            txnFilters={txnFilters}
          />
        </div>
      ) : null}

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.headerTitle}>Earning Transactions</div>
          </div>
          <div className={styles.tnxTopBarButtonsWrap}>
            {shouldShowFilters && !isMobilePairs ? (
              <button className={styles.tnxTopBarButton} onClick={handleOpenDownloadReport}>
                <div className={styles.tnxTopBarButtonText}>Get Report</div>
                <img className={styles.tnxTopBarButtonIcon} alt='icon' src={downloadIcon} />
              </button>
            ) : null}
          </div>
        </div>

        <div className={styles.horizontalLine}></div>

        {isMobilePairs && shouldShowFilters ? (
          <div className={styles.filterWrapMobile}>
            <button className={styles.tnxTopBarButton} onClick={handleOpenDownloadReport}>
              <img className={styles.tnxTopBarButtonIcon} alt='icon' src={downloadIcon} />
            </button>
            <TxnHistoryFiltersPairs
              transactionType={TYPE_TXN_HISTORY.STAKING}
              setTxnFilters={setTxnFilters}
              txnFilters={txnFilters}
            />
          </div>
        ) : null}

        {/* mobile */}
        {!error && transactions?.length && isMobilePairs ? (
          <div className={styles.listContainer}>
            {sections.map((section, sectionIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={sectionIndex} className={styles.listSection}>
                {renderSectionHeader({ section })}
                {section.data.map(item => (
                  <div key={item.id}>{renderItem(item)}</div>
                ))}
              </div>
            ))}
            <div ref={loaderTriggerRef} className={styles.loaderTrigger}>
              .
            </div>
          </div>
        ) : null}

        {/* desktop desktop-s table */}
        {!error && sortedTransactions?.length && !isMobilePairs ? (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <div className={clsx(styles.headerText, styles.cell1)}>Date</div>
              <div className={clsx(styles.headerText, styles.cell2)}>Type</div>
              <div className={clsx(styles.headerText, styles.cell3)}>Amount</div>
              <div className={clsx(styles.headerText, styles.cell4)} style={{ flex: 0.5 }}>
                Asset
              </div>
            </div>

            <div className={styles.tableRowsWrap}>
              {sortedTransactions.map(transaction => {
                const addCommasToAmount = addCommasToDisplayValue(
                  transaction.increasedByAmount || transaction.amount || '',
                  8
                )

                return (
                  <div key={transaction.id} onClick={() => handelSelectRow(transaction)} className={styles.tableRow}>
                    <div className={clsx(styles.dateText, styles.cell1)}>
                      {moment(transaction?.operationTime).format('YYYY-MM-DD')}
                    </div>
                    <div className={clsx(styles.text, styles.cell2)}>{transaction.title}</div>
                    <div className={clsx(styles.text, styles.cell3)}>
                      {getAmountSign(transaction.title)}
                      {addCommasToAmount}
                    </div>
                    <div className={clsx(styles.text, styles.cell4)} style={{ flex: 0.5 }}>
                      {transaction.assetId}
                    </div>
                  </div>
                )
              })}
              <div ref={loaderTriggerRef} className={styles.loaderTrigger}>
                .
              </div>
            </div>
          </div>
        ) : null}

        {loading && (
          <div className={styles.loader}>
            <Spinner />
          </div>
        )}
        {!loading && !error && !txnFilters.filterOptions?.length && !transactions?.length ? (
          <NoHistoryPlaceholder />
        ) : null}
        {!loading && !error && txnFilters.filterOptions?.length && !transactions?.length ? <NoResultsFilter /> : null}
        {!loading && error ? <HistoryResponseError /> : null}
      </div>
    </div>
  )
}
