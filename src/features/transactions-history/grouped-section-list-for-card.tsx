import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import moment from 'moment'
import clsx from 'clsx'

import { Modal, Spinner } from 'components'
import { TxnCardDetail } from 'features/modals/transaction-history-detail/txn-card-detail'
import { getToken } from 'utils'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { getStatus } from 'utils/transactions-history/get-status'
import { getStatusIndicatorColor } from 'utils/transactions-history/get-status-indicator-color'
import { CardHistoryQueryParams } from 'wip/services'
import { ExtendedAccountStatementRecord, getCardHistoryByFilterFx, RECORD_COUNT } from 'model/card-history'

import { TYPE_TXN_HISTORY } from './constants'
import { getCardCategoryName } from './helpers/get-card-category-name'
import { processAndGroupDataForCard, SectionCard } from './process-and-group-data-for-card'
import styles from './styles.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

type RenderItemType = {
  item: ExtendedAccountStatementRecord
}

type Props = {
  data: ExtendedAccountStatementRecord[]
  queryParams: CardHistoryQueryParams
  setResponseError: Dispatch<SetStateAction<string>>
}

export const GroupedSectionListForCard = ({ data, queryParams, setResponseError }: Props) => {
  const currentMonth = moment().format('MMMM YYYY')
  const loaderRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const { isMobilePairs } = useCurrentBreakpointPairs()

  const [sections, setSections] = useState<SectionCard[]>(() => processAndGroupDataForCard(data, currentMonth))
  const [isLoading, setIsLoading] = useState(false)
  const [fromRecord, setFromRecord] = useState(RECORD_COUNT)
  const [hasMore, setHasMore] = useState(true)
  const [responseData, setResponseData] = useState<ExtendedAccountStatementRecord[]>(data)

  const fetchMoreData = async (newFromRecord: number) => {
    setResponseError('')

    if (!(data.length < RECORD_COUNT)) {
      setIsLoading(true)
      try {
        const requestData = {
          ...queryParams,
          fromRecord: newFromRecord,
        }

        const response = await getCardHistoryByFilterFx(requestData)

        if (response && response.length > 0) {
          setFromRecord(prevFromRecord => prevFromRecord + RECORD_COUNT)
          return response
        }

        if (response.length < RECORD_COUNT) {
          setHasMore(false)
        }
      } catch (error) {
        setResponseError('error')
        console.log('ERROR - fetchMoreData')
      } finally {
        setIsLoading(false)
      }
    } else {
      setHasMore(false)
      setIsLoading(false)
    }
  }

  const handleObserver = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && !isLoading && hasMore) {
        const response = await fetchMoreData(fromRecord)

        if (response) {
          const newSections = processAndGroupDataForCard(response, currentMonth)
          setResponseData(prevData => [...prevData, ...response])

          setSections(prevSections => {
            const sectionsMap: Record<string, SectionCard> = {}

            prevSections.forEach(section => {
              sectionsMap[section.title] = {
                title: section.title,
                data: [...section.data],
              }
            })

            newSections.forEach(newSection => {
              if (sectionsMap[newSection.title]) {
                sectionsMap[newSection.title].data = [...sectionsMap[newSection.title].data, ...newSection.data]
              } else {
                sectionsMap[newSection.title] = newSection
              }
            })

            return Object.values(sectionsMap)
          })
        }
      }
    },
    [isLoading, data, currentMonth]
  )

  useEffect(() => {
    if (loaderRef.current) {
      observerRef.current = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      })

      if (loaderRef.current) {
        observerRef.current.observe(loaderRef.current)
      }
    }

    return () => {
      if (observerRef.current && loaderRef.current) {
        observerRef.current.unobserve(loaderRef.current)
      }
    }
  }, [handleObserver])

  const handelSelectRow = (rowValue: ExtendedAccountStatementRecord) => {
    Modal.open(<TxnCardDetail data={rowValue} />, { title: '', variant: 'center' })
  }

  const renderFormatAmount = (item: ExtendedAccountStatementRecord | undefined) => {
    if (!item) return <div className={styles.listTextAmount}>no data</div>

    return (
      <>
        {item.transactionType === TYPE_TXN_HISTORY.CARD ? (
          <div
            className={clsx(
              styles.listTextAmount,
              +item?.transactionAmount > 0 ? styles.listGreenColor : '',
              item.status === 'PENDING' ? styles.listPendingStyle : ''
            )}
          >
            {+item?.transactionAmount > 0 ? '+' : ''}
            {addCommasToDisplayValue(item.transactionAmount || '', 3)} {item.transactionCurrencyCode}
            {item.status === 'CANCELED' ? <div className={styles.listStrikethrough} /> : null}
          </div>
        ) : null}
      </>
    )
  }

  const renderItem = ({ item }: RenderItemType) => {
    return (
      <>
        {[TYPE_TXN_HISTORY.CARD].includes(item.transactionType) ? (
          <div className={styles.listRow} onClick={() => handelSelectRow(item)}>
            <img className={styles.listIcon} alt='icon' src={item.icon} />
            <div className={styles.listRowTitleWrap}>
              <div className={styles.listRowTitle}>
                {item.group === 'WITHDRAW' ? 'Cash Withdrawal' : item.merchantName}
              </div>
              <div className={styles.listTextDate}>{moment(item.purchaseDate).format('MMMM DD, YYYY')}</div>
            </div>
            <div className={styles.flexGrow1} />
            <div className={styles.listTextAmountWrap}>
              <div className={styles.positionRelative}>{renderFormatAmount(item)}</div>
              {item.status ? (
                <div className={styles.listTextStatus}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </>
    )
  }

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <div className={styles.listSectionTitle}>{title}</div>
  )

  return (
    <>
      {/* mobile */}
      {sections?.length && isMobilePairs ? (
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

          {hasMore ? (
            <div ref={loaderRef} style={{ height: 1, textAlign: 'center' }}>
              <Spinner />
            </div>
          ) : null}
        </div>
      ) : null}

      {/* desktop desktop-s table */}
      {responseData?.length && !isMobilePairs ? (
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <div className={clsx(styles.headerText, styles.cell1)}>Date</div>
            <div className={clsx(styles.headerText, styles.cell2)}>Category / Type</div>
            <div className={clsx(styles.headerText, styles.cell3)}>Merchant</div>
            <div className={clsx(styles.headerText, styles.cell4)}>Amount</div>
            <div className={clsx(styles.headerText, styles.cell5)}>Status</div>
          </div>

          <div className={styles.tableRowsWrap}>
            {responseData.map(item => {
              const statusIndicatorColor1 = getStatusIndicatorColor(item.status)
              const statusIndicatorColor2 = getStatusIndicatorColor(item.status, 'secondary')
              const statusText = getStatus(item.status)

              const category = getCardCategoryName(item)

              return (
                <div key={item.id} onClick={() => handelSelectRow(item)} className={styles.tableRow}>
                  <div className={clsx(styles.dateText, styles.cell1)}>
                    {moment(item.purchaseDate).format('YYYY-MM-DD')}
                  </div>
                  <div className={clsx(styles.text, styles.cell2)}>{category}</div>
                  <div className={clsx(styles.text, styles.cell3)}>
                    {item.group === 'WITHDRAW' ? 'Cash Withdrawal' : item.merchantName}
                  </div>
                  <div className={clsx(styles.text, styles.cell4)}>
                    {+item?.transactionAmount > 0 ? '+' : ''}
                    {addCommasToDisplayValue(item.transactionAmount || '', 3)} {item.transactionCurrencyCode}
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
            {hasMore ? (
              <div ref={loaderRef} style={{ height: 1, textAlign: 'center' }}>
                <Spinner />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
