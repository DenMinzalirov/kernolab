import { Fragment, useEffect, useRef } from 'react'
import clsx from 'clsx'

import { Modal, Spinner } from 'components'
import { TYPE_TXN_HISTORY } from 'features/transactions-history/constants'
import { useTxnHistory } from 'features/transactions-history/hooks'
import { UnifiedHistoryTypeForBiz } from 'features/transactions-history/hooks/type'

import { FilterOptionsBizType } from '../txn-history-biz'
import { prepareTransactionData } from './helpers/prepare-transaction-data'
import styles from './styles.module.scss'
import { TxnDetailsBiz } from './txn-details-biz'
import { BREAKPOINT, useCurrentBreakpoint } from 'hooks/use-current-breakpoint'

const defaultFilterOptions: FilterOptionsBizType[] = []

type Props = {
  transactionType: string
  filterOptions?: FilterOptionsBizType[]
  isPreview?: boolean
}

export const TxnHistoryTableBiz = ({
  transactionType,
  isPreview = false,
  filterOptions = defaultFilterOptions,
}: Props) => {
  const loaderTriggerRef = useRef<HTMLDivElement>(null)

  const { transactions, loading, error, loadMore } = useTxnHistory<UnifiedHistoryTypeForBiz[]>(
    transactionType,
    filterOptions
  )

  const { currentBreakpointBiz } = useCurrentBreakpoint()

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

  const sortedTransactions = transactions.slice().sort((a, b) => {
    return new Date(b.operationTime).getTime() - new Date(a.operationTime).getTime()
  })

  const previewRowCount = [BREAKPOINT.xxl].includes(currentBreakpointBiz) ? 20 : 5
  const transactionsForTable = isPreview ? sortedTransactions.slice(0, previewRowCount) : sortedTransactions

  const handleShowDetail = (rowData: UnifiedHistoryTypeForBiz) => {
    Modal.open(<TxnDetailsBiz data={rowData} />, { title: '', variant: 'center' })
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <div className={clsx(styles.headerText, styles.cell1)}>Date</div>
        <div className={clsx(styles.headerText, styles.cell2)}>Asset</div>
        <div className={clsx(styles.headerText, styles.cell3)}>Type</div>
        <div className={clsx(styles.headerText, styles.cell4)}>Amount</div>
        <div className={clsx(styles.headerText, styles.cell5)}>State</div>
      </div>

      {!loading && !transactionsForTable.length && (
        <div className={styles.placeholder}>
          {transactionType === TYPE_TXN_HISTORY.FIAT ? (
            <>
              <p className={styles.placeholderText}>You don&#39;t have any fiat transactions yet.</p>
              <p className={styles.placeholderText}>Start using the app to see your activity here.</p>
            </>
          ) : (
            <p className={styles.placeholderText}>No Transactions Yet.</p>
          )}
        </div>
      )}

      {!error && !!transactionsForTable.length && (
        <div className={styles.tableRowsWrap}>
          {transactionsForTable.map(transaction => {
            const {
              dateForDisplay,
              assetId,
              operationTypeForDisplay,
              amountForDisplay,
              statusBadgeStyle,
              statusText,
              statusColorTextForMd,
            } = prepareTransactionData(transaction)

            return (
              <Fragment key={transaction.id}>
                {/* onlg xxl xl lg */}
                <div
                  onClick={() => handleShowDetail(transaction)}
                  className={clsx(styles.tableRow, styles.hideMdAndDown)}
                >
                  <div className={clsx(styles.dateText, styles.cell1)}>{dateForDisplay}</div>
                  <div className={clsx(styles.text, styles.cell2)}>{assetId}</div>
                  <div className={clsx(styles.text, styles.cell3)}>{operationTypeForDisplay}</div>
                  <div className={clsx(styles.text, styles.cell4)}>{amountForDisplay}</div>
                  <div className={clsx(styles.cell5, styles.statusBadgeWrap)}>
                    <div className={clsx(styles.statusBadge, styles[statusBadgeStyle])}>{statusText}</div>
                  </div>
                </div>

                {/* only md */}
                <div
                  onClick={() => handleShowDetail(transaction)}
                  className={clsx(styles.tableRow, styles.showMdAndDown)}
                >
                  <div>
                    <div className={styles.text}>{operationTypeForDisplay}</div>
                    <div className={styles.dateText}>{dateForDisplay}</div>
                  </div>
                  <div>
                    <div className={styles.text}>
                      {assetId} {amountForDisplay}
                      <div className={clsx(styles.statusTextMd, styles[statusColorTextForMd])}>{statusText}</div>
                    </div>
                  </div>
                </div>
              </Fragment>
            )
          })}

          {isPreview ? null : (
            <div ref={loaderTriggerRef} className={styles.loaderTrigger}>
              .
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className={styles.loader}>
          <Spinner />
        </div>
      )}
    </div>
  )
}
