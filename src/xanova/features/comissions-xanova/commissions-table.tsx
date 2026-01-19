import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useUnit } from 'effector-react'

import { Modal } from 'components'
import { toTitleCase } from 'utils/to-title-case'
import { TransportCommission } from 'wip/services'
import {
  $commissionsFiltersXanova,
  requestCommissionsXanova,
  setCommissionsPageSizeXanova,
  setCommissionsPageXanova,
  setCommissionsSearchXanova,
  syncCommissionsPaginationXanova,
  useCommissionsFilterConfig,
} from 'model/commissions-filters-xanova'
import { $commissionsXanova, getCommissionsXanovaFx } from 'model/commissions-xanova'

import filterIcon from '../../icon-xanova/filter-icon.svg'
import searchIcon from '../../icon-xanova/search-icon.svg'
import { formatAmount, formatCommissionStatus, formatCommissionType, formatDate } from './helpers'
import { DataTable, TableColumn, TablePaginationConfig } from 'xanova/components/data-table'
import { FilterXanova } from 'xanova/components/filter-xanova'
import { StatusPill } from 'xanova/components/status-pill'

type CommissionTableRow = {
  id: string
  createdAt: string
  memberEmail: string
  amount: string
  commissionType: string
  commissionStatus: string
}

export function ComissionsTable() {
  const [commissions, isLoading, filters, changePage, changePageSize, setSearchQuery, triggerFetch, syncPagination] =
    useUnit([
      $commissionsXanova,
      getCommissionsXanovaFx.pending,
      $commissionsFiltersXanova,
      setCommissionsPageXanova,
      setCommissionsPageSizeXanova,
      setCommissionsSearchXanova,
      requestCommissionsXanova,
      syncCommissionsPaginationXanova,
    ])
  const hasSyncedInitialPagination = useRef(false)

  useEffect(() => {
    triggerFetch()
  }, [triggerFetch])

  useEffect(() => {
    if (!commissions) return

    if (!hasSyncedInitialPagination.current) {
      const serverPage = (commissions.number ?? 0) + 1
      const serverSize = commissions.size ?? filters.size

      hasSyncedInitialPagination.current = true

      if (serverPage > 0 && (serverPage !== filters.page || serverSize !== filters.size)) {
        syncPagination({ page: serverPage, size: serverSize })
        triggerFetch()
      }

      return
    }

    const totalPages = commissions.totalPages ?? 0
    if (totalPages > 0 && filters.page > totalPages) {
      changePage(totalPages)
    }

    if ((commissions.totalElements ?? 0) === 0 && filters.page !== 1) {
      changePage(1)
    }
  }, [commissions, filters.page, filters.size, changePage, syncPagination, triggerFetch])

  const tableData = useMemo<CommissionTableRow[]>(() => {
    if (!commissions?.content) return []

    return commissions.content.map(item => ({
      id: String(item.id),
      createdAt: formatDate(item.createdAt),
      memberEmail: item.referredMemberEmail ?? '—',
      amount: formatAmount(item.amount),
      commissionType: formatCommissionType(item.commissionType),
      commissionStatus: formatCommissionStatus(item.commissionStatus),
    }))
  }, [commissions])

  const closeFilters = useCallback(() => {
    Modal.close()
  }, [])

  const filterConfig = useCommissionsFilterConfig({ onApplied: closeFilters })

  const activeFiltersCount = useMemo(() => {
    const statusCount = filters.commissionStatus_in.length
    const typeCount = filters.commissionType_in.length
    const dateCount = filters.createdAt_from || filters.createdAt_to ? 1 : 0
    return statusCount + typeCount + dateCount
  }, [filters.commissionStatus_in, filters.commissionType_in, filters.createdAt_from, filters.createdAt_to])

  const handleSearch = useCallback(
    (query: string) => {
      // setSearchQuery(query)
    },
    [setSearchQuery]
  )

  const handleOpenFilters = () => {
    Modal.open(<FilterXanova config={filterConfig} />, { title: '', variant: 'right' })
  }

  const renderStatus = (status: string) => <StatusPill status={status} />

  const columns: Array<TableColumn<CommissionTableRow>> = [
    {
      id: 'date',
      header: 'Date',
      dataKey: 'createdAt',
      responsive: { mobile: { slot: 'secondary', label: 'Date' } },
    },
    {
      id: 'member',
      header: 'Referred Member',
      dataKey: 'memberEmail',
      responsive: { mobile: { hidden: true, label: 'Referred Member' } },
    },
    {
      id: 'amount',
      header: 'Comission Earned',
      dataKey: 'amount',
      responsive: { mobile: { slot: 'primary', label: 'Comission Earned' } },
    },
    {
      id: 'type',
      header: 'Type',
      dataKey: 'commissionType',
      responsive: {
        mobile: {
          slot: 'collapsed',
          collapsedLabel: 'memberEmail',
          collapsedValue: 'commissionType',
        },
      },
    },
    {
      id: 'status',
      header: 'Status',
      align: 'right',
      render: row => renderStatus(row.commissionStatus),
      responsive: { mobile: { slot: 'status', label: 'Status' } },
    },
  ]

  const pagination: TablePaginationConfig = {
    totalItems: commissions?.totalElements ?? 0,
    currentPage: filters.page,
    pageSize: filters.size,
    onPageChange: changePage,
    onPageSizeChange: changePageSize,
    showSummary: false,
    mode: 'server',
  }

  return (
    <DataTable<CommissionTableRow>
      title='Recent Activity'
      data={tableData}
      columns={columns}
      isLoading={isLoading}
      emptyState='No commissions yet'
      searchConfig={{
        placeholder: 'Search',
        onSearch: handleSearch,
        icon: <img alt='icon' src={searchIcon} />,
      }}
      filtersTrigger={{
        label: 'Filter',
        onClick: handleOpenFilters,
        icon: <img alt='icon' src={filterIcon} />,
        count: activeFiltersCount,
        isActive: activeFiltersCount > 0,
      }}
      pagination={pagination}
      rowKey={row => row.id}
      disableTabletReflow={true}
    />
  )
}
