import { useEffect, useState } from 'react'
import { useUnit } from 'effector-react/effector-react.umd'
import clsx from 'clsx'

import { Modal } from 'components'
import { OTCClient, OTCTrade, OTCTradeServices, PageOTCTrade } from 'wip/services/fideumOTC-services/OTC-trade'
import filterIcon from 'assets/icons/history/filter-icon2.svg'

import { TradesCounter } from '../../components/TradesCounter'
import { NewTradeModalFideumOTC } from '../../modals-fideumOTC'
import { $clientsOTC } from '../../model/clients-fideumOTC'
import {
  $filters,
  filterFieldChangedEv,
  filtersResetEv,
  FilterState,
  initialFilters,
  pageChangedEv,
} from '../../model/filters-fideumOTC'
import { $paginationInfo, $tradesOTC } from '../../model/trades-fideumOTC'
import { OTCClientStatus } from '../clients-fideumOTC/types'
import { formatAmount } from '../clients-fideumOTC/utils'
import { Pagination } from './Pagination'
import { SortButton } from './SortButton'
import styles from './styles.module.scss'
import { TableFilters } from './TableFilters'
import { ExtendedColumnConfig, LocalTradeData, SortConfig, SortDirection } from './types'
import { getCellValue, getStatusBadgeStyle } from './utils'
import { transformFiltersToQueryParams } from 'fideumOTC/utils/transformFiltersToQueryParams'

export function TradesFideumOTC() {
  const data = useUnit($tradesOTC)
  const clients = useUnit($clientsOTC)
  const paginationInfo = useUnit($paginationInfo)
  const filters = useUnit($filters)

  // Функция для проверки отличий фильтров от начальных значений
  const hasFiltersChanged = (): boolean => {
    return JSON.stringify(filters) !== JSON.stringify(initialFilters)
  }

  // Check that data exists and is an array
  const safeData = Array.isArray(data) ? data : []

  const [loading, setLoading] = useState(false)
  const [additionalClients, setAdditionalClients] = useState<OTCClient[]>([]) // Дополнительно загруженные клиенты
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'createdAt', direction: 'desc' })

  const [columnConfig, setColumnConfig] = useState<ExtendedColumnConfig[]>([
    { key: 'clientUuid', label: 'Client', width: 1.3, visible: true, sortable: false },
    { key: 'liquidityProvider', label: 'LP', width: 0.5, visible: true, sortable: true },
    { key: 'instrument', label: 'Instrument', width: 1, visible: true, sortable: true },
    { key: 'side', label: 'Side', width: 0.8, visible: true, sortable: true },
    { key: 'amount', label: 'Amount', width: 0.8, visible: true, sortable: true },
    // { key: 'expectedExecutionPrice', label: 'Expected Price', width: 1, visible: true, sortable: true },
    // { key: 'slippagePercent', label: 'Slippage %', width: 0.8, visible: true, sortable: true },
    // { key: 'clientPrice', label: 'Client Price', width: 1, visible: true, sortable: true },
    { key: 'executedPrice', label: 'Executed Price', width: 1, visible: true, sortable: true },
    { key: 'profit', label: 'Profit', width: 1, visible: true, sortable: false },
    { key: 'status', label: 'Status', width: 0.8, visible: true, sortable: true },
    { key: 'createdAt', label: 'Date', width: 1.2, visible: true, sortable: true },
  ])

  const visibleColumns = columnConfig.filter(col => col.visible)

  // Объединяем глобальных и дополнительно загруженных клиентов
  const allClients = [...clients, ...additionalClients]

  // Эффект для загрузки недостающих клиентов
  useEffect(() => {
    const fetchMissingClients = async () => {
      if (!safeData.length) return

      // Получаем уникальные UUID клиентов из трейдов
      const tradeClientUuids = [...new Set(safeData.map(trade => trade.clientUuid).filter(Boolean))]

      // Находим UUID клиентов, которых нет в глобальном состоянии
      const existingClientUuids = new Set(clients.map(c => c.clientUuid))
      const missingClientUuids = tradeClientUuids.filter(uuid => !existingClientUuids.has(uuid))

      if (missingClientUuids.length === 0) {
        // Все клиенты уже загружены, очищаем дополнительных
        setAdditionalClients([])
        return
      }

      try {
        // Загружаем недостающих клиентов одним запросом
        // Используем clientUuid_in (параметр существует на бэкенде, но не в типах)
        const params: any = {
          size: 1000,
          page: 0,
        }

        if (missingClientUuids.length > 0) {
          params.clientUuid_in = missingClientUuids.join()
        }

        const response = await OTCTradeServices.getOTCClients(params)

        if (response.content && response.content.length > 0) {
          setAdditionalClients(response.content)
        }
      } catch (error) {
        console.error('ERROR-fetchMissingClients', error)

        // Fallback: загружаем клиентов по одному (если clientUuid_in не поддерживается)
        try {
          const clientPromises = missingClientUuids.map(uuid =>
            OTCTradeServices.getOTCClients({
              clientUuid_eq: uuid,
              size: 1,
              page: 0,
            })
          )

          const responses = await Promise.all(clientPromises)
          const fetchedClients = responses.map(res => res.content[0]).filter(Boolean)

          if (fetchedClients.length > 0) {
            setAdditionalClients(fetchedClients)
          }
        } catch (fallbackError) {
          console.error('ERROR-fetchMissingClients-fallback', fallbackError)
        }
      }
    }

    fetchMissingClients()
  }, [safeData, clients])

  const handleSortChange = (column: keyof LocalTradeData, direction: SortDirection) => {
    setSortConfig({ column: direction ? column : null, direction })
    filterFieldChangedEv({ field: 'sort', value: direction ? `${column},${direction}` : '' })
  }

  const handlePageChange = (page: number) => {
    pageChangedEv(page)
  }

  const openModalTrade = () => {
    Modal.open(<NewTradeModalFideumOTC />, { variant: 'center' })
  }

  const handleTrade = (tradeData: OTCTrade) => {
    Modal.open(<NewTradeModalFideumOTC key={tradeData.tradeUuid} uuid={tradeData.tradeUuid} />, {
      variant: 'center',
    })
  }

  const handleOpenFilters = () => {
    Modal.open(<TableFilters />, { variant: 'right-top' })
  }

  // Функция для конвертации логов в CSV формат
  function formatHeader(key: string): string {
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2') // разделяем camelCase -> camel Case
      .replace(/_/g, ' ') // если вдруг snake_case
      .replace(/\s+/g, ' ') // убираем лишние пробелы
      .trim()
      .replace(/^./, c => c.toUpperCase()) // первая буква заглавная
  }

  const convertLogsToCSV = (OTCTradeData: OTCTrade[]): string => {
    if (OTCTradeData.length === 0) return ''

    // Берём ключи первого объекта
    const keys = Object.keys(OTCTradeData[0])

    // Форматируем заголовки
    const headers = keys.map(formatHeader)

    // Формируем строки CSV
    const csvRows = [
      headers.join(','), // первая строка — заголовки
      ...OTCTradeData.map(item =>
        keys
          .map(key => {
            const value = (item as unknown as Record<string, unknown>)[key]

            // Приводим к строке и экранируем кавычки
            const safe = value !== null && value !== undefined ? String(value).replace(/"/g, '""') : ''
            return `"${safe}"`
          })
          .join(',')
      ),
    ]

    return csvRows.join('\n')
  }

  // Функция для скачивания CSV файла
  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  async function fetchAllOTCTrades(filtersParams: FilterState, size = 10000): Promise<OTCTrade[]> {
    const transformFiltersParams = transformFiltersToQueryParams(filtersParams)
    let page = 0
    const all: OTCTrade[] = []
    let last = false

    while (!last) {
      const res: PageOTCTrade = await OTCTradeServices.getOTCTrades({
        ...transformFiltersParams,
        page,
        size,
      })

      if (Array.isArray(res.content) && res.content.length > 0) {
        all.push(...res.content)
      }

      if (typeof res.last === 'boolean') {
        last = res.last
      } else {
        last = true
      }
      page += 1
    }

    return all
  }

  const getReport = async () => {
    try {
      const allTrades = await fetchAllOTCTrades(filters, 2000)

      const csvData = convertLogsToCSV(allTrades)
      downloadCSV(csvData, 'otc-trade-logs.csv')
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  const cellRenderers = {
    status: (trade: OTCTrade, column: any) => (
      <div className={clsx(styles.statusBadgeWrap)}>
        <div className={clsx(styles.statusBadge, styles[getStatusBadgeStyle(trade.status || '')])}>
          {getCellValue(trade, column.key)}
        </div>
      </div>
    ),
    clientUuid: (trade: OTCTrade, column: any) => {
      const clientUuid = trade.clientUuid
      const client = allClients.find(clientItem => clientItem.clientUuid === clientUuid)
      const stylesColor = {
        [OTCClientStatus.CONFIRMED]: 'green',
        [OTCClientStatus.PENDING]: 'yellow',
        [OTCClientStatus.REJECTED]: 'red',
      }

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div>{client?.fullName || '-'}</div>
            {client?.fullName ? (
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '100%',
                  backgroundColor: (client && stylesColor[client.status]) || 'red',
                }}
              />
            ) : null}
          </div>
          <div style={{ marginRight: 5 }}>{client?.email}</div>
        </div>
      )
    },
    profit: (trade: OTCTrade, column: any) => {
      const from = trade.instrument.substring(0, 3) //btc
      const to = trade.instrument.slice(-3)

      // base - counter
      let baseAmount
      let counterAmount
      let baseProfit
      let counterProfit
      let tradeCurrency

      if (trade.currency === from) {
        baseAmount = +trade.amount
        counterAmount = +trade.amount * +trade.executedPrice

        baseProfit = trade.side === 'BUY' ? +trade.clientLeftAmount - baseAmount : baseAmount - +trade.clientLeftAmount
        counterProfit =
          trade.side === 'BUY' ? +trade.clientRightAmount - counterAmount : counterAmount - +trade.clientRightAmount
        tradeCurrency = to
      } else {
        baseAmount = +trade.amount / +trade.executedPrice
        counterAmount = +trade.amount
        baseProfit = trade.side === 'SELL' ? +trade.clientLeftAmount - baseAmount : baseAmount - +trade.clientLeftAmount
        counterProfit =
          trade.side === 'SELL' ? +trade.clientRightAmount - counterAmount : counterAmount - +trade.clientRightAmount
        tradeCurrency = to
      }
      const totalEurTrade = baseAmount * +trade.baseCurrencyToEurRate
      const baseProfitEur = baseProfit * +trade.baseCurrencyToEurRate
      const counterProfitEur = counterProfit * +trade.counterCurrencyToEurRate

      // if (trade.tradeUuid === 'a4300fe2-af90-4941-8e6a-941140a6262a') {
      //   console.log({ baseAmount, counterAmount, baseProfit, counterProfit })
      // }

      return (
        <div>
          <div>{(baseProfit + counterProfit).toFixed(5) + ' ' + tradeCurrency}</div>
          <div style={{ fontSize: 10 }} className={styles.dateText}>
            {(baseProfitEur + counterProfitEur).toFixed(2) + ' EUR'}
          </div>
        </div>
      )
    },
    amount: (trade: OTCTrade) => {
      const valueRight = (tradeItem: OTCTrade) => {
        const from = tradeItem.instrument?.substring(0, 3)
        let value
        if (tradeItem.currency === from) {
          value = +tradeItem.amount * +tradeItem.baseCurrencyToEurRate
        } else {
          value = +tradeItem.amount * +tradeItem.counterCurrencyToEurRate
        }
        return value ? `${value.toFixed(2)} EUR` : ''
      }

      return (
        <div>
          <div>{formatAmount(trade.amount as string) + ' ' + trade.currency}</div>
          <div style={{ fontSize: 10 }} className={styles.dateText}>
            {valueRight(trade)}
          </div>
        </div>
      )
    },
    // profit: (trade: OTCTrade, column: any) => {
    //   let profit: number = 0
    //   if (trade.side === 'BUY') {
    //     profit = (Number(trade?.clientPrice || 0) - Number(trade?.executedPrice || 0)) * +trade.amount
    //   } else {
    //     profit = (Number(trade?.executedPrice || 0) - Number(trade?.clientPrice || 0)) * +trade.amount
    //   }
    //
    //   const percent = ` / ${((profit / (+trade.executedPrice * +trade.amount)) * 100).toFixed(2)}%`
    //   // executed
    //   return (
    //     <div>
    //       {profit}
    //       {trade.status === 'EXECUTED' ? percent : ''}
    //     </div>
    //   )
    // },
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <div className={styles.headerText}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div className={styles.btnGroupWrap} onClick={handleOpenFilters}>
            <img className={styles.btnGroupIcon} alt='icon' src={filterIcon} />
            {hasFiltersChanged() ? (
              <span
                onClick={e => {
                  e.stopPropagation()
                  filtersResetEv()
                }}
                className={styles.closeBadge}
              >
                ×
              </span>
            ) : null}
          </div>
          <button onClick={openModalTrade} style={{ width: 120, alignSelf: 'end' }} className={'btn-biz blue'}>
            +Add New
          </button>
          <button onClick={getReport} style={{ width: 120, alignSelf: 'end' }} className={'btn-biz grey'}>
            Get Report
          </button>
        </div>
      </div>
      <TradesCounter />
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          {visibleColumns.map((column, index) => (
            <div
              key={column.key}
              className={clsx(styles.headerText, styles[`cell${index + 1}`])}
              style={{ flex: column.width }}
            >
              <div className={styles.headerContent}>
                <span>{column.label}</span>
                {column.sortable && (
                  <SortButton
                    currentSort={sortConfig.column === column.key ? sortConfig.direction : null}
                    onSortChange={direction => handleSortChange(column.key, direction)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {!loading && !safeData.length && (
          <div className={styles.placeholder}>
            <p className={styles.placeholderText}>No trades available</p>
          </div>
        )}

        {!loading && !!safeData.length && (
          <div className={styles.tableRowsWrap}>
            {safeData.map(trade => {
              if (!trade || typeof trade !== 'object') return null

              const tradeKey = trade.tradeUuid || `trade-${Math.random()}`

              return (
                <div key={tradeKey} className={styles.tableRow} onClick={() => handleTrade(trade)}>
                  {visibleColumns.map((column, index) => (
                    <div
                      key={column.key}
                      className={clsx(
                        column.key === 'createdAt' ? styles.dateText : styles.text,
                        styles[`cell${index + 1}`]
                      )}
                      style={{ flex: column.width, justifyContent: 'center' }}
                    >
                      {cellRenderers[column.key as keyof typeof cellRenderers]
                        ? cellRenderers[column.key as keyof typeof cellRenderers](trade, column)
                        : getCellValue(trade, column.key)}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {loading && (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
          </div>
        )}
      </div>

      {/* Пагинация */}
      <Pagination
        currentPage={paginationInfo.currentPage}
        totalPages={paginationInfo.totalPages}
        onPageChange={handlePageChange}
      />
    </>
  )
}
