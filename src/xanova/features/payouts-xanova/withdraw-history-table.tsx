import { useCallback, useMemo } from 'react'

import { Modal } from 'components'

import filterIcon from '../../icon-xanova/filter-icon.svg'
import type { TableColumn } from 'xanova/components/data-table'
import { DataTable } from 'xanova/components/data-table'
import { FilterXanova } from 'xanova/components/filter-xanova'
import { StatusPill } from 'xanova/components/status-pill'
import { useWithdrawHistoryXanova, type WithdrawHistoryXanovaItem } from 'xanova/hooks/use-withdraw-history-xanova'

const DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const METHOD_LABELS = {
  crypto: 'USDC',
  bank: 'Bank Transfer',
} as const

const STATUS_LABELS = {
  PENDING: 'Pending',
  COMPLETED: 'Payed Out',
  REFUSED: 'Refused',
  TRAVEL_RULE_PENDING: 'Travel Rule Pending',
} as const

type TableRow = {
  id: string
  createdAt: string
  method: string
  amount: string
  destination: string
  status: string
  statusLabel: string
}

const formatDate = (value: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return DATE_FORMATTER.format(date)
}

const formatAmount = (amount?: string, assetId?: string) => {
  if (!amount) return '—'

  const numeric = Number(amount)
  const formatted = Number.isNaN(numeric)
    ? amount
    : numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })

  return assetId ? `${formatted} ${assetId}` : formatted
}

const resolveDestination = (item: WithdrawHistoryXanovaItem) => {
  if (item.method === 'bank') {
    const iban = item.fiatDetails?.iban
    if (!iban) return '—'
    const tail = iban.slice(-4)
    return `****${tail}`
  }

  const address = item.cryptoDetails?.destinationAddress
  if (!address) return '—'
  if (address.length <= 6) return address

  const head = address.slice(0, 3)
  const tail = address.slice(-3)
  return `${head}...${tail}`
}

const resolveStatus = (status?: string) => {
  if (!status) return '—'
  return STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status
}

export function WithdrawHistoryTable() {
  const { items, loading, tablePagination, applyFilterValues, filters } = useWithdrawHistoryXanova({
    pageSize: 10,
  })

  const rows = useMemo<TableRow[]>(() => {
    return items.map(item => ({
      id: String(item.id),
      createdAt: formatDate(item.operationTime),
      method: METHOD_LABELS[item.method],
      amount: formatAmount(item.amount, item.assetId),
      destination: resolveDestination(item),
      status: item.status ?? '',
      statusLabel: resolveStatus(item.status),
    }))
  }, [items])

  const columns = useMemo<TableColumn<TableRow>[]>(() => {
    return [
      {
        id: 'date',
        header: 'Date',
        dataKey: 'createdAt',
        responsive: {
          mobile: { slot: 'secondary', label: 'Date' },
        },
      },
      {
        id: 'amount',
        header: 'Amount',
        dataKey: 'amount',
        responsive: {
          mobile: { slot: 'primary', label: 'Amount' },
        },
      },
      {
        id: 'method',
        header: 'Method',
        dataKey: 'method',

        responsive: {
          mobile: { slot: 'collapsed', collapsedLabel: 'method', collapsedValue: 'destination', label: 'Amount' },
        },
      },
      {
        id: 'destination',
        header: 'Destination',
        dataKey: 'destination',
        responsive: {
          mobile: { hidden: true, label: 'Destination' },
        },
      },
      {
        id: 'status',
        header: 'Status',
        align: 'right',
        render: row => <StatusPill status={row.status} label={row.statusLabel} />,
        responsive: {
          mobile: { slot: 'status', label: 'Status' },
        },
      },
    ]
  }, [])

  const handleApplyFilters = (values: Record<string, string[]>) => {
    applyFilterValues(values)
    Modal.close()
  }

  const handleClearFilters = () => {
    applyFilterValues({})
    Modal.close()
  }

  const activeFiltersCount = useMemo(() => {
    const methodsCount = filters.methods.length
    const dateCount = filters.from || filters.to ? 1 : 0
    return methodsCount + dateCount
  }, [filters.from, filters.methods, filters.to])

  const handleOpenFilters = useCallback(() => {
    Modal.open(
      <FilterXanova
        config={{
          title: 'Filters',
          sections: [
            {
              id: 'operationTypes',
              title: 'Method',
              type: 'checkbox',
              options: [
                {
                  id: 'method-crypto',
                  label: METHOD_LABELS.crypto,
                  value: 'crypto',
                  checked: filters.methods.includes('crypto'),
                },
                {
                  id: 'method-bank',
                  label: METHOD_LABELS.bank,
                  value: 'bank',
                  checked: filters.methods.includes('bank'),
                },
              ],
            },
            {
              id: 'date-range',
              title: 'Date Range',
              type: 'date',
              placeholder: 'DD/MM/YYYY',
              value: {
                from: filters.from,
                to: filters.to,
              },
            },
          ],
          applyLabel: 'Apply',
          onApply: handleApplyFilters,
          onClear: handleClearFilters,
        }}
      />,
      { title: '', variant: 'right' }
    )
  }, [filters.from, filters.methods, filters.to, handleApplyFilters, handleClearFilters])

  return (
    <DataTable<TableRow>
      title='Withdrawal History'
      data={rows}
      columns={columns}
      isLoading={loading}
      emptyState='No withdraw history yet'
      pagination={tablePagination}
      rowKey={row => row.id}
      filtersTrigger={{
        label: 'Filter',
        onClick: handleOpenFilters,
        icon: <img alt='Filter' src={filterIcon} />,
        count: activeFiltersCount,
        isActive: activeFiltersCount > 0,
      }}
    />
  )
}
