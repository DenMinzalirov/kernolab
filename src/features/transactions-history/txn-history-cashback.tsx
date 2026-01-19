import { useEffect, useRef } from 'react'
import moment from 'moment'
import clsx from 'clsx'

import { Modal, Spinner } from 'components'
import { HistoryResponseError } from 'components/history-response-error'
import { NoHistoryPlaceholder } from 'components/no-history-placeholder'
import { FilterOptionsType } from 'features/modals/transaction-filter'
import { TxnCashbackDetail } from 'features/modals/transaction-history-detail/txn-cashback-detail'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { formatDecimalWithEllipsis } from 'utils/transactions-history/format-decimal-with-ellipsis'

import { TYPE_TXN_HISTORY } from './constants'
import { useTxnHistory } from './hooks'
import { CryptoAndFiatHistoryTypeNew } from './hooks/type'
import { processAndGroupDataForCashback } from './process-and-group-data-for-cashback'
import styles from './styles.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

const defaultFilterOptions: FilterOptionsType[] = []
export function TxnHistoryCashback() {
  const loaderTriggerRef = useRef<HTMLDivElement>(null)
  const { isMobilePairs } = useCurrentBreakpointPairs()

  const { transactions, loading, error, loadMore } = useTxnHistory<CryptoAndFiatHistoryTypeNew[]>(
    TYPE_TXN_HISTORY.CASHBACK,
    defaultFilterOptions
  )

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

  const currentMonth = moment().format('MMMM YYYY')

  const handelSelectRow = (rowValue: any) => {
    Modal.open(<TxnCashbackDetail data={rowValue} />, {
      variant: 'center',
    })
  }

  const renderItem = ({ item }: any) => {
    const addCommasToCashbackAmount = addCommasToDisplayValue(item.cashbackAmount, 3)
    const amountWithEllipsis = formatDecimalWithEllipsis(addCommasToCashbackAmount)

    return (
      <div className={styles.listRow} onClick={() => handelSelectRow(item)}>
        <img className={styles.listIcon} alt='icon' src={item.icon} />
        <div className={styles.listRowTitleWrap}>
          <div className={styles.listRowTitle}>{item.title}</div>
          <div className={styles.listTextDate}>{moment(item.transactionDate).format('MMMM DD, YYYY hh:mm')}</div>
        </div>
        <div className={styles.flexGrow1} />
        <div className={styles.listTextAmountWrap}>
          <div className={styles.positionRelative}>
            <div className={clsx(styles.listTextAmount, styles.textAlignEnd)}>
              +{amountWithEllipsis} {item.cashbackAssetId}
            </div>
          </div>

          <div className={styles.listTextStatus}>
            {item.cashbackAmount && +item.cashbackAmount !== 0
              ? addCommasToDisplayValue((item.cashbackAmount / item.exchangeRate).toString(), 2)
              : ''}{' '}
            {item.accountCurrencyCode}
          </div>
        </div>
      </div>
    )
  }

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <div className={styles.listSectionTitle}>{title}</div>
  )

  const sections = isMobilePairs ? processAndGroupDataForCashback(transactions, currentMonth) : []
  const sortedTransactions = transactions.slice().sort((a, b) => {
    return new Date(b.transactionDate || '').getTime() - new Date(a.transactionDate || '').getTime()
  })

  return (
    <div className={styles.containerWrap}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>Cashback</div>
        </div>

        <div className={styles.horizontalLine}></div>

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
              <div className={clsx(styles.headerText, styles.cell2)}>Amount $FI</div>
              <div className={clsx(styles.headerText, styles.cell3, styles.textAlignEnd)}>Amount EUR</div>
            </div>

            <div className={styles.tableRowsWrap}>
              {sortedTransactions.map(transaction => {
                const date = moment(transaction.transactionDate).format('YYYY-MM-DD')
                const addCommasToCashbackAmount = addCommasToDisplayValue(transaction.cashbackAmount, 3)
                const amountWithEllipsis = formatDecimalWithEllipsis(addCommasToCashbackAmount)
                const currencyAmount =
                  (transaction.cashbackAmount ? +transaction.cashbackAmount : 0) /
                  (transaction.exchangeRate ? +transaction.exchangeRate : 0)
                const currencyAmountForDisplay = addCommasToDisplayValue(currencyAmount.toString(), 6)

                return (
                  <div key={transaction.id} onClick={() => handelSelectRow(transaction)} className={styles.tableRow}>
                    <div className={clsx(styles.dateText, styles.cell1)}>{date}</div>
                    <div className={clsx(styles.text, styles.cell2)}>
                      +{amountWithEllipsis} {transaction.cashbackAssetId}
                    </div>
                    <div className={clsx(styles.cashbackAmountEur, styles.cell3, styles.textAlignEnd)}>
                      {currencyAmountForDisplay} EUR
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
        {!loading && !error && !transactions?.length ? <NoHistoryPlaceholder /> : null}
        {!loading && error ? <HistoryResponseError /> : null}
      </div>
    </div>
  )
}
