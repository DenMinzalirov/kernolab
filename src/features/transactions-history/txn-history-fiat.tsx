import { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import clsx from 'clsx'

import { Modal, Spinner } from 'components'
import { HistoryResponseError } from 'components/history-response-error'
import { NoHistoryPlaceholder } from 'components/no-history-placeholder'
import { NoResultsFilter } from 'components/no-results-filter'
import { TxnCryptoAndFiatDetail } from 'features/modals/transaction-history-detail/txn-crypto-and-fiat-detail'
import { TxnFiltersState, TxnHistoryFiltersPairs } from 'features/txn-history-filters-pairs'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { getAmountSign } from 'utils/transactions-history/get-amount-sign'
import { getStatus } from 'utils/transactions-history/get-status'
import downloadIcon from 'assets/icons/download-icon.svg'

import { DownloadReportModal } from '../modals/download-report'
import { GREEN_TEXT_STYLES, TITLE_TXN_HISTORY_NEW, TYPE_TXN_HISTORY } from './constants'
import { prepareTransactionData } from './helpers/prepare-transaction-data'
import { useTxnHistory } from './hooks'
import { CryptoAndFiatHistoryTypeNew } from './hooks/type'
import { processAndGroupDataForCryptoAndFiat } from './process-and-group-data-for-crypto-and-fiat'
import styles from './styles.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

export function TxnHistoryFiat() {
  const loaderTriggerRef = useRef<HTMLDivElement>(null)

  const [txnFilters, setTxnFilters] = useState<TxnFiltersState>({
    filterOptions: [],
    filtersData: {
      date: [],
      asset: [],
      type: [],
    },
  })

  const { transactions, loading, error, loadMore } = useTxnHistory<CryptoAndFiatHistoryTypeNew[]>(
    TYPE_TXN_HISTORY.FIAT,
    txnFilters.filterOptions
  )
  const { isMobilePairs } = useCurrentBreakpointPairs()

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
      <DownloadReportModal transactionType={TYPE_TXN_HISTORY.FIAT} filterOptions={txnFilters.filterOptions} />,
      {
        title: '',
        variant: 'center',
        // isFullScreen: true,
      }
    )
  }

  const handelSelectRow = (rowValue: any) => {
    Modal.open(<TxnCryptoAndFiatDetail data={rowValue} />, { variant: 'center' })
  }

  const renderFormatAmount = (item: CryptoAndFiatHistoryTypeNew | undefined) => {
    if (!item) return <div className={styles.listTextAmount}>no data</div>

    const amount = item.amount
    const assetId = item.assetId

    return (
      <>
        <div
          className={clsx(
            styles.listTextAmount,
            GREEN_TEXT_STYLES.includes(item.title || '') && styles.listGreenColor,
            ['PENDING', 'TRAVEL_RULE_PENDING'].includes(item.withdrawStatus || '') && styles.listPendingStyle
          )}
        >
          {getAmountSign(item.title)}
          {addCommasToDisplayValue(amount ? (+amount).toString() : '', 2)} {assetId}
        </div>
        {item.withdrawStatus === 'REFUSED' ? <div className={styles.listStrikethrough} /> : null}
      </>
    )
  }

  const renderItem = ({ item }: any) => (
    <div className={styles.listRow} onClick={() => handelSelectRow(item)}>
      <img className={styles.listIcon} alt='icon' src={item.icon} />
      <div className={styles.listRowTitleWrap}>
        <div className={styles.listRowTitle}>
          {item.title} {item.title === TITLE_TXN_HISTORY_NEW.EXCHANGE ? `${item.fromAssetId} to ${item.toAssetId}` : ''}
        </div>
        <div className={styles.listTextDate}>{moment(item.operationTime).format('MMMM DD, YYYY')}</div>
      </div>
      <div className={styles.flexGrow1} />
      <div className={styles.listTextAmountWrap}>
        <div className={styles.positionRelative}>{renderFormatAmount(item)}</div>
        {item.withdrawStatus ? <div className={styles.listTextStatus}>{getStatus(item.withdrawStatus)}</div> : null}
      </div>
    </div>
  )

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <div className={styles.listSectionTitle}>{title}</div>
  )

  const currentMonth = moment().format('MMMM YYYY')
  const sections = isMobilePairs ? processAndGroupDataForCryptoAndFiat(transactions, currentMonth) : []

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
            transactionType={TYPE_TXN_HISTORY.FIAT}
            setTxnFilters={setTxnFilters}
            txnFilters={txnFilters}
          />
        </div>
      ) : null}

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>Fiat Transactions</div>
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
              transactionType={TYPE_TXN_HISTORY.FIAT}
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
                {section.data.map((item, itemIndex) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={itemIndex}>{renderItem({ item })}</div>
                ))}
              </div>
            ))}
            <div ref={loaderTriggerRef} className={styles.loaderTrigger}>
              .
            </div>
          </div>
        ) : null}

        {/* desktop desktop-s table */}
        {!error && transactions?.length && !isMobilePairs ? (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <div className={clsx(styles.headerText, styles.cell1)}>Date</div>
              <div className={clsx(styles.headerText, styles.cell2)}>Type</div>
              <div className={clsx(styles.headerText, styles.cell3)}>Amount</div>
              <div className={clsx(styles.headerText, styles.cell4)}>Asset</div>
              <div className={clsx(styles.headerText, styles.cell5)}>Status</div>
            </div>

            <div className={styles.tableRowsWrap}>
              {sortedTransactions.map(transaction => {
                const {
                  dateForDisplay,
                  assetId,
                  operationTypeForDisplay,
                  amountForDisplay,
                  statusText,
                  amountSign,
                  statusIndicatorColor1,
                  statusIndicatorColor2,
                } = prepareTransactionData(transaction)

                return (
                  <div key={transaction.id} onClick={() => handelSelectRow(transaction)} className={styles.tableRow}>
                    <div className={clsx(styles.dateText, styles.cell1)}>{dateForDisplay}</div>
                    <div className={clsx(styles.text, styles.cell2)}>{operationTypeForDisplay}</div>
                    <div className={clsx(styles.text, styles.cell3)}>
                      {amountSign}
                      {amountForDisplay}
                    </div>
                    <div className={clsx(styles.text, styles.cell4)}>{assetId} </div>
                    <div className={styles.cell5}>
                      <div className={styles.statusBlockWrap}>
                        <div className={styles.statusIndicatorWrap}>
                          <div className={clsx(styles.statusIndicator, styles[statusIndicatorColor1])}></div>
                          <div className={clsx(styles.statusIndicator, styles[statusIndicatorColor2])}></div>
                        </div>
                        <div className={styles.statusBlockText}>{statusText}</div>
                      </div>
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
