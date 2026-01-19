import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import moment from 'moment'

import { Modal } from 'components'
import { DownloadReportModal } from 'features/modals/download-report'
import { TYPE_TXN_HISTORY } from 'features/transactions-history/constants'
import { CloseCircleIcon10 } from 'icons/close-circle-icon-10'
import { DownloadIcon14 } from 'icons/download-icon-14'

import { MyBalancesBiz } from '../my-balances-biz'
import { TxnHistoryFiltersBiz } from '../txn-history-filters-biz'
import { TxnHistoryTableBiz } from '../txn-history-table-biz'
import styles from './styles.module.scss'

export type FilterOptionsBizType = {
  field: string
  value: string
}

export type FilterDataType = {
  date: string[]
  asset: string[]
  type: string[]
  status: string[]
}

const fieldMapping: Record<string, string> = {
  asset: 'ASSET_TYPE',
  date: 'TIME',
  type: 'TRANSACTION_TYPE',
  status: 'STATUS',
}

function transformFilterOptions(filterOptions: FilterDataType): FilterOptionsBizType[] {
  const result: FilterOptionsBizType[] = []

  for (const [key, values] of Object.entries(filterOptions)) {
    const field = fieldMapping[key]

    if (field) {
      values.forEach(value => {
        let transformedValue = value

        if (key === 'date') {
          const dateParts = value.split(' - ').map(part => moment(part, 'DD/MM/YYYY').format('YYYY-MM-DD'))
          transformedValue = dateParts.join(' - ')
        }

        result.push({ field, value: transformedValue })
      })
    }
  }

  return result
}

function isFiltersEmpty(filters: FilterDataType): boolean {
  return Object.values(filters).every(arr => arr.length === 0)
}

export const filtersDataDefault: FilterDataType = {
  date: [],
  asset: [],
  type: [],
  status: [],
}

export function TxnHistoryBiz() {
  const location = useLocation()
  const filterOptionsProps = location.state?.data

  const [filtersData, setFiltersData] = useState(filterOptionsProps || filtersDataDefault)

  const filterOptions: FilterOptionsBizType[] = transformFilterOptions(filtersData)

  const handleResetFilters = () => {
    setFiltersData(filtersDataDefault)
  }

  const handleOpenDownloadReport = () => {
    Modal.open(<DownloadReportModal transactionType={TYPE_TXN_HISTORY.BIZ} filterOptions={filterOptions} />, {
      title: '',
      variant: 'center',
    })
  }

  return (
    <div className={styles.container}>
      <MyBalancesBiz />

      <div className={styles.filterWrap}>
        <div className={styles.txnHistoryLabelWrap}>
          <label className={styles.txnHistoryLabel}>Transaction History</label>

          <div className={styles.reportBtnWrap}>
            <button onClick={handleOpenDownloadReport} className='btn-with-icon-biz light-blue hide-md-and-down'>
              Get Report
              <DownloadIcon14 />
            </button>

            <button onClick={handleOpenDownloadReport} className={styles.reportBtnMd}>
              <DownloadIcon14 fill='var(--White)' />
            </button>

            {!isFiltersEmpty(filtersData) ? (
              <button onClick={handleResetFilters} className='btn-with-icon-biz blue'>
                Reset Filters
                <CloseCircleIcon10 />
              </button>
            ) : null}
          </div>
        </div>

        <TxnHistoryFiltersBiz filtersData={filtersData} setFiltersData={setFiltersData} />
      </div>

      <div className={styles.txnHistoryWrap}>
        <TxnHistoryTableBiz transactionType={TYPE_TXN_HISTORY.BIZ} filterOptions={filterOptions} />
      </div>
    </div>
  )
}
