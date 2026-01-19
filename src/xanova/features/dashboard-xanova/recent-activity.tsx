import { useEffect, useMemo } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { requestCommissionsXanova } from 'model/commissions-filters-xanova'
import { $commissionsXanova } from 'model/commissions-xanova'

import { formatAmount, formatCommissionStatus, formatDate } from '../comissions-xanova/helpers'
import styles from './styles.module.scss'
import { DataTable, TableColumn } from 'xanova/components/data-table'

type TableRowData = {
  id: string
  date: string
  action: string
}

const TABLE_COLUMNS: Array<TableColumn<TableRowData>> = [
  {
    id: 'data',
    dataKey: 'date',
    header: 'Date',
    responsive: { mobile: { slot: 'secondary', label: 'Date' } },
  },
  {
    id: 'action',
    dataKey: 'action',
    header: 'Action',
    responsive: { mobile: { slot: 'primary', label: 'Service' } },
  },
]

export function RecentActivity() {
  const [commissions, triggerFetch] = useUnit([$commissionsXanova, requestCommissionsXanova])

  useEffect(() => {
    triggerFetch()
  }, [triggerFetch])

  const tableData = useMemo<TableRowData[]>(() => {
    if (!commissions?.content) return []

    return commissions.content.map(item => ({
      id: String(item.id),
      date: formatDate(item.createdAt),
      action: `${formatAmount(item.amount)} ${formatCommissionStatus(item.commissionStatus)}`,
    }))
  }, [commissions])

  return (
    <div className={clsx(styles.gridBlock, styles.bottomCenterWidget)}>
      <DataTable<TableRowData>
        title='Recent Activity'
        data={tableData}
        columns={tableData.length > 0 ? TABLE_COLUMNS : []}
        emptyState='No users yet'
        rowKey={row => row.id}
        className={styles.customDataTableWrap}
      />
    </div>
  )
}
