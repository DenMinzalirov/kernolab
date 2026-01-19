import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import moment from 'moment'
import clsx from 'clsx'

import { Modal, Spinner } from 'components'
import { HistoryResponseError } from 'components/history-response-error'
import { NoHistoryPlaceholder } from 'components/no-history-placeholder'
import { NoResultsFilter } from 'components/no-results-filter'
import { pages } from 'constant'
import { TxnCryptoAndFiatDetail } from 'features/modals/transaction-history-detail/txn-crypto-and-fiat-detail'
import { TravelRuleRequests } from 'features/travel-rule-requests'
import { TxnFiltersState, TxnHistoryFiltersPairs } from 'features/txn-history-filters-pairs'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { formatDecimalWithEllipsis } from 'utils/transactions-history/format-decimal-with-ellipsis'
import { getAmountSign } from 'utils/transactions-history/get-amount-sign'
import { getAmount } from 'utils/transactions-history/get-amout'
import { getAssetId } from 'utils/transactions-history/get-asset-id'
import { getStatus } from 'utils/transactions-history/get-status'
import { $travelRuleData } from 'model/travel-rule-transactions'
import downloadIcon from 'assets/icons/download-icon.svg'

import { DownloadReportModal } from '../modals/download-report'
import { GREEN_TEXT_STYLES, TITLE_TXN_HISTORY_NEW, TYPE_TXN_HISTORY } from './constants'
import { prepareTransactionData } from './helpers/prepare-transaction-data'
import { useTxnHistory } from './hooks'
import { CryptoAndFiatHistoryTypeNew } from './hooks/type'
import { processAndGroupDataForCryptoAndFiat } from './process-and-group-data-for-crypto-and-fiat'
import styles from './styles.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

const TXN_HISTORY_TAB = {
  CRYPTO_TRANSACTIONS: 'Crypto Transactions',
  TRAVEL_RULE_REQUESTS: 'Travel Rule Requests',
}

type Props = {
  filterAssetId?: string
  isPreview?: boolean
}
export function TxnHistoryCrypto({ filterAssetId, isPreview }: Props) {
  const navigate = useNavigate()
  const loaderTriggerRef = useRef<HTMLDivElement>(null)

  const travelRuleData = useUnit($travelRuleData)
  const [activeTab, setActiveTab] = useState(
    /* travelRuleData.length ? TXN_HISTORY_TAB.TRAVEL_RULE_REQUESTS : */ TXN_HISTORY_TAB.CRYPTO_TRANSACTIONS
  )
  const isActiveTabTravelRule = activeTab === TXN_HISTORY_TAB.TRAVEL_RULE_REQUESTS

  const { isMobilePairs, isTabletPairs } = useCurrentBreakpointPairs()

  const [txnFilters, setTxnFilters] = useState<TxnFiltersState>({
    filterOptions: filterAssetId ? [{ field: 'ASSET_TYPE', value: filterAssetId }] : [],
    filtersData: {
      date: [],
      asset: filterAssetId ? [filterAssetId] : [],
      type: [],
    },
  })

  const { transactions, loading, error, loadMore } = useTxnHistory<CryptoAndFiatHistoryTypeNew[]>(
    TYPE_TXN_HISTORY.CRYPTO,
    txnFilters.filterOptions
  )

  const handleActive = (tabName: string) => {
    setActiveTab(tabName)
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
      <DownloadReportModal transactionType={TYPE_TXN_HISTORY.CRYPTO} filterOptions={txnFilters.filterOptions} />,
      {
        title: '',
        variant: 'center',
        // centerMobileFix: true,
        // isFullScreen: true,
      }
    )
  }

  const currentMonth = moment().format('MMMM YYYY')

  const handelSelectRow = (rowValue: any) => {
    Modal.open(<TxnCryptoAndFiatDetail data={rowValue} />, { variant: 'center' })
  }

  const renderFormatAmount = (item: CryptoAndFiatHistoryTypeNew | undefined) => {
    if (!item) return <div className={styles.listTextAmount}>no data</div>

    const assetId = getAssetId(item)
    const amount = getAmount(item)
    const addCommasToAmount = addCommasToDisplayValue(amount || '', 3)
    const amountWithEllipsis = formatDecimalWithEllipsis(addCommasToAmount)

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
          {amountWithEllipsis} {assetId}
        </div>
        {item.withdrawStatus === 'REFUSED' ? <div className={styles.listStrikethrough} /> : null}
      </>
    )
  }

  const renderItem = ({ item }: any) => (
    <div className={styles.listRow} onClick={() => handelSelectRow(item)}>
      <img className={styles.listIcon} alt='icon' src={item.icon} />
      <div className={styles.listRowTitleWrap}>
        <div
          className={clsx(
            styles.listRowTitle,
            ['PENDING', 'TRAVEL_RULE_PENDING'].includes(item.withdrawStatus || '') && styles.listPendingStyle
          )}
        >
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

  const handleGoBack = () => {
    navigate(-1)
  }

  const sections = isMobilePairs ? processAndGroupDataForCryptoAndFiat(transactions, currentMonth) : []

  const sortedTransactions = transactions.slice().sort((a, b) => {
    return new Date(b.operationTime).getTime() - new Date(a.operationTime).getTime()
  })

  const shouldShowFilters =
    !!transactions?.length || !!txnFilters.filterOptions.length || (loading && !txnFilters.filterOptions.length)

  return (
    <div className={styles.containerWrap}>
      {!isMobilePairs && shouldShowFilters && !isPreview ? (
        <div className={styles.filterWrap}>
          <TxnHistoryFiltersPairs
            transactionType={TYPE_TXN_HISTORY.CRYPTO}
            setTxnFilters={setTxnFilters}
            txnFilters={txnFilters}
          />
        </div>
      ) : null}

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerTitleWrap}>
            {travelRuleData.length && !isPreview
              ? Object.values(TXN_HISTORY_TAB).map(itemName => {
                  return (
                    <div
                      key={itemName}
                      onClick={() => handleActive(itemName)}
                      className={clsx(styles.navMenuItem, {
                        [styles.navMenuItemActive]: itemName === activeTab,
                      })}
                    >
                      {itemName}
                    </div>
                  )
                })
              : null}

            {!travelRuleData.length && !isPreview ? (
              <div className={styles.headerTitle}>Crypto Transactions</div>
            ) : null}

            {isPreview ? <div className={styles.headerTitle}>{'Recent Transactions'}</div> : null}
          </div>
          <div className={styles.tnxTopBarButtonsWrap}>
            {shouldShowFilters && !isMobilePairs && !isPreview ? (
              <button className={styles.tnxTopBarButton} onClick={handleOpenDownloadReport}>
                <div className={styles.tnxTopBarButtonText}>Get Report</div>
                <img className={styles.tnxTopBarButtonIcon} alt='icon' src={downloadIcon} />
              </button>
            ) : null}

            {isPreview && transactions?.length ? (
              <div
                className={styles.tnxBtnViewAll}
                onClick={() => navigate(pages.TRANSACTIONS_HISTORY.path, { state: { assetId: filterAssetId } })}
              >
                View all
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.horizontalLine} />

        {isMobilePairs && shouldShowFilters && !isActiveTabTravelRule && !isPreview ? (
          <div className={styles.filterWrapMobile}>
            <button className={styles.tnxTopBarButton} onClick={handleOpenDownloadReport}>
              <img className={styles.tnxTopBarButtonIcon} alt='icon' src={downloadIcon} />
            </button>
            <TxnHistoryFiltersPairs
              transactionType={TYPE_TXN_HISTORY.CRYPTO}
              setTxnFilters={setTxnFilters}
              txnFilters={txnFilters}
            />
          </div>
        ) : null}

        {isActiveTabTravelRule && !isPreview ? <TravelRuleRequests /> : null}

        {/* mobile */}
        {!error && transactions?.length && isMobilePairs && !isActiveTabTravelRule ? (
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
            {isPreview ? null : (
              <div ref={loaderTriggerRef} className={styles.loaderTrigger}>
                .
              </div>
            )}
          </div>
        ) : null}

        {/* desktop desktop-s table */}
        {!error && transactions?.length && !isMobilePairs && !isActiveTabTravelRule ? (
          <div className={styles.tableContainer}>
            {isPreview ? (
              <div className={styles.tableHeader}>
                <div className={clsx(styles.headerText, styles.cell1, styles.width100px)}>Date</div>
                <div className={clsx(styles.headerText, styles.cell2)}>Type</div>
                <div className={clsx(styles.headerText, styles.cell3, !isTabletPairs && styles.textAlignEnd)}>
                  Amount
                </div>
                {isTabletPairs ? <div className={clsx(styles.headerText, styles.cell5)}>Status</div> : null}
              </div>
            ) : (
              <div className={styles.tableHeader}>
                <div className={clsx(styles.headerText, styles.cell1)}>Date</div>
                <div className={clsx(styles.headerText, styles.cell2)}>Type</div>
                <div className={clsx(styles.headerText, styles.cell3)}>Amount</div>
                <div className={clsx(styles.headerText, styles.cell4)}>Asset</div>
                <div className={clsx(styles.headerText, styles.cell5)}>Status</div>
              </div>
            )}

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

                const fromAssetId = transaction?.fromAssetId || ''
                const toAssetId = transaction?.toAssetId || ''

                if (isPreview) {
                  return (
                    <div key={transaction.id} onClick={() => handelSelectRow(transaction)} className={styles.tableRow}>
                      <div className={clsx(styles.dateText, styles.cell1, styles.width100px)}>{dateForDisplay}</div>
                      <div className={clsx(styles.text, styles.cell2)}>{operationTypeForDisplay}</div>
                      <div className={clsx(styles.text, styles.cell3, !isTabletPairs && styles.textAlignEnd)}>
                        {amountSign}
                        {amountForDisplay} {assetId}
                      </div>

                      {isTabletPairs ? (
                        <div className={styles.cell5}>
                          <div className={styles.statusBlockWrap}>
                            <div className={styles.statusIndicatorWrap}>
                              <div className={clsx(styles.statusIndicator, styles[statusIndicatorColor1])}></div>
                              <div className={clsx(styles.statusIndicator, styles[statusIndicatorColor2])}></div>
                            </div>
                            <div className={styles.statusBlockText}>{statusText}</div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                }

                return (
                  <div key={transaction.id} onClick={() => handelSelectRow(transaction)} className={styles.tableRow}>
                    <div className={clsx(styles.dateText, styles.cell1)}>{dateForDisplay}</div>
                    <div className={clsx(styles.text, styles.cell2)}>{operationTypeForDisplay}</div>
                    <div className={clsx(styles.text, styles.cell3)}>
                      {amountSign}
                      {amountForDisplay}
                    </div>
                    <div className={clsx(styles.text, styles.cell4)}>
                      {fromAssetId && toAssetId ? `${fromAssetId} to ${toAssetId}` : assetId}
                    </div>
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

              {isPreview ? null : (
                <div ref={loaderTriggerRef} className={styles.loaderTrigger}>
                  .
                </div>
              )}
            </div>
          </div>
        ) : null}

        {loading && (
          <div className={styles.loader}>
            <Spinner />
          </div>
        )}

        {!loading &&
        !error &&
        !txnFilters.filterOptions?.length &&
        !transactions?.length &&
        !isActiveTabTravelRule &&
        !isPreview ? (
          <NoHistoryPlaceholder />
        ) : null}

        {!loading &&
        !error &&
        txnFilters.filterOptions?.length &&
        !transactions?.length &&
        !isActiveTabTravelRule &&
        !isPreview ? (
          <NoResultsFilter />
        ) : null}

        {!loading && error ? <HistoryResponseError /> : null}

        {!loading &&
        !error &&
        txnFilters.filterOptions?.length &&
        !transactions?.length &&
        !isActiveTabTravelRule &&
        isPreview ? (
          <NoHistoryPlaceholder />
        ) : null}
      </div>
    </div>
  )
}
