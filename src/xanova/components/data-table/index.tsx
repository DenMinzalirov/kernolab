import { type KeyboardEvent, type MouseEvent, type ReactNode, useCallback, useMemo, useState } from 'react'
import clsx from 'clsx'

import { Spinner } from 'components'
import { isXanova } from 'config'

import styles from './styles.module.scss'
import type { DataTableProps, TableColumn } from './types'
import { useMobileColumns } from './use-mobile-columns'
import { hasRenderableValue, resolveCellContent } from './utils'
import { useCurrentBreakpointXanova } from 'hooks/use-current-breakpoint-xanova'
import { Pagination } from 'xanova/components/pagination'
import { TableSearchInput } from 'xanova/components/table-search-input'
import { ExpandArrowIcon } from 'xanova/icon-xanova/expand-arrow-icon'

export * from './types'

export function DataTable<T extends Record<string, unknown>>({
  title,
  columns,
  data,
  isLoading = false,
  emptyState,
  rowKey,
  searchConfig,
  filtersTrigger,
  pagination,
  className,
  disableTabletReflow = false,
  disableMobileReflow = false,
}: DataTableProps<T>) {
  const tableClassName = clsx(styles.wrapper, { [styles.wrapperXanova]: isXanova }, className)
  const { isTabletXanova, isMobileXanova } = useCurrentBreakpointXanova()

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const isTabletLayout = isTabletXanova && !disableTabletReflow
  const isMobileLayout = isMobileXanova && !disableMobileReflow

  const { visibleColumns, hiddenTabletColumns } = useMemo(() => {
    if (!isTabletLayout) {
      return { visibleColumns: columns, hiddenTabletColumns: [] as Array<TableColumn<T>> }
    }

    const visible = columns.filter(column => !column.responsive?.tablet?.hidden)
    const hidden = columns.filter(column => column.responsive?.tablet?.hidden)

    return {
      visibleColumns: visible.length > 0 ? visible : columns,
      hiddenTabletColumns: hidden,
    }
  }, [columns, isTabletLayout])

  const { primaryMobileColumn, secondaryMobileColumn, statusMobileColumn, collapsedMobileColumn, detailMobileColumns } =
    useMobileColumns(columns, isMobileLayout)

  const tabletColumnsTemplate = useMemo(
    () => `repeat(${Math.max(visibleColumns.length, 1)}, minmax(0, 1fr))`,
    [visibleColumns.length]
  )

  const toggleRowExpansion = useCallback((key: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }, [])

  const handleCardRowToggle = useCallback(
    (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>, key: string, expandable: boolean) => {
      if (!expandable) {
        return
      }

      const target = event.target as HTMLElement
      if (target && target.closest('a,button,input,select,textarea,label')) {
        return
      }

      if ('key' in event) {
        if (event.key !== 'Enter' && event.key !== ' ') {
          return
        }
        event.preventDefault()
      }

      toggleRowExpansion(key)
    },
    [toggleRowExpansion]
  )

  const showToolbar = Boolean(searchConfig) || Boolean(filtersTrigger)
  const { rows: rowsToRender, offset: rowsOffset } = (() => {
    if (!pagination) {
      return { rows: data, offset: 0 }
    }

    const paginationMode = pagination.mode ?? 'client'

    if (paginationMode === 'server') {
      return { rows: data, offset: 0 }
    }

    const totalItemsValue = pagination.totalItems ?? data.length
    const totalPages = Math.max(1, Math.ceil(totalItemsValue / pagination.pageSize))
    const safeCurrentPage = Math.min(Math.max(1, pagination.currentPage), totalPages)
    const startIndex = (safeCurrentPage - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize

    return { rows: data.slice(startIndex, endIndex), offset: startIndex }
  })()

  const detailLabelForColumn = useCallback((column: TableColumn<T>) => {
    return column.responsive?.mobile?.label ?? column.responsive?.tablet?.label ?? column.header
  }, [])

  const resolveCollapsedLabel = useCallback(
    (column: TableColumn<T>, row: T): ReactNode => {
      const mobileConfig = column.responsive?.mobile
      if (mobileConfig?.slot === 'collapsed' && mobileConfig.collapsedLabel) {
        return typeof mobileConfig.collapsedLabel === 'function'
          ? mobileConfig.collapsedLabel(row)
          : (row[mobileConfig.collapsedLabel] as ReactNode)
      }

      return detailLabelForColumn(column)
    },
    [detailLabelForColumn]
  )

  const resolveCollapsedValue = useCallback((column: TableColumn<T>, row: T): ReactNode => {
    const mobileConfig = column.responsive?.mobile
    if (mobileConfig?.slot === 'collapsed' && mobileConfig.collapsedValue) {
      return typeof mobileConfig.collapsedValue === 'function'
        ? mobileConfig.collapsedValue(row)
        : (row[mobileConfig.collapsedValue] as ReactNode)
    }

    return resolveCellContent(column, row)
  }, [])

  const renderMobileTable = () => {
    if (isLoading) {
      return (
        <div className={styles.mobileTable}>
          <div className={styles.loadingState}>
            <Spinner />
          </div>
        </div>
      )
    }

    if (rowsToRender.length === 0) {
      return (
        <div className={styles.mobileTable}>
          <div className={styles.emptyState}>{emptyState ?? 'No data to display'}</div>
        </div>
      )
    }

    const isExpandable = detailMobileColumns.length > 0

    return (
      <div className={styles.mobileTable}>
        {rowsToRender.map((row, index) => {
          const rowIndex = rowsOffset + index
          const rawKey = rowKey ? rowKey(row, rowIndex) : rowIndex
          const rowKeyValue = String(rawKey)
          const isExpanded = Boolean(expandedRows[rowKeyValue])

          const primaryContent = primaryMobileColumn ? resolveCellContent(primaryMobileColumn, row) : null
          const secondaryContent = secondaryMobileColumn ? resolveCellContent(secondaryMobileColumn, row) : null
          const statusContent = statusMobileColumn ? resolveCellContent(statusMobileColumn, row) : null
          const collapsedLabel = collapsedMobileColumn ? resolveCollapsedLabel(collapsedMobileColumn, row) : null
          const collapsedValue = collapsedMobileColumn ? resolveCollapsedValue(collapsedMobileColumn, row) : null
          const shouldRenderCollapsed = !isExpanded && collapsedMobileColumn && hasRenderableValue(collapsedValue)

          return (
            <div
              key={rowKeyValue}
              className={clsx(
                styles.mobileRowCard,
                isExpandable && styles.cardRowExpandable,
                isExpanded && styles.cardRowExpanded
              )}
              role={isExpandable ? 'button' : undefined}
              tabIndex={isExpandable ? 0 : undefined}
              aria-expanded={isExpandable ? isExpanded : undefined}
              onClick={event => handleCardRowToggle(event, rowKeyValue, isExpandable)}
              onKeyDown={event => handleCardRowToggle(event, rowKeyValue, isExpandable)}
            >
              <div className={styles.mobileRowMain}>
                <div className={styles.mobileRowInfo}>
                  {primaryMobileColumn ? <div className={styles.mobileRowPrimary}>{primaryContent}</div> : null}
                  {secondaryMobileColumn ? <div className={styles.mobileRowSecondary}>{secondaryContent}</div> : null}
                </div>
                {(statusContent || isExpandable) && (
                  <div className={styles.mobileRowStatus}>
                    {statusContent ? <div className={styles.mobileRowStatusContent}>{statusContent}</div> : null}
                  </div>
                )}
              </div>
              {shouldRenderCollapsed && collapsedLabel ? (
                <div className={styles.mobileRowCollapsedSection}>
                  <span className={styles.mobileRowDivider} aria-hidden='true' />
                  <div className={styles.mobileRowCollapsedDetail}>
                    <span className={styles.mobileRowCollapsedLabel}>{collapsedLabel}</span>
                    <span className={styles.mobileRowCollapsedValue}>{collapsedValue}</span>
                  </div>
                </div>
              ) : null}
              {isExpandable && isExpanded ? (
                <div className={styles.cardDetails}>
                  {(collapsedMobileColumn ? [...detailMobileColumns, collapsedMobileColumn] : detailMobileColumns).map(
                    column => (
                      <div key={column.id} className={styles.cardDetailsItem}>
                        <span className={styles.cardDetailsLabel}>{detailLabelForColumn(column)}</span>
                        <span className={styles.cardDetailsDots} aria-hidden='true' />
                        <span className={styles.cardDetailsValue}>{resolveCellContent(column, row)}</span>
                      </div>
                    )
                  )}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    )
  }

  const renderTabletHeader = (
    <div className={styles.tabletHeader} style={{ gridTemplateColumns: tabletColumnsTemplate }}>
      {visibleColumns.map(column => (
        <span
          key={column.id}
          className={clsx(
            styles.tabletHeaderCell,
            column.align === 'center' && styles.tabletHeaderCellAlignCenter,
            column.align === 'right' && styles.tabletHeaderCellAlignRight
          )}
        >
          {column.header}
        </span>
      ))}
    </div>
  )

  const renderTabletTable = () => {
    const content = (() => {
      if (isLoading) {
        return (
          <div className={styles.loadingState}>
            <Spinner />
          </div>
        )
      }

      if (rowsToRender.length === 0) {
        return <div className={styles.emptyState}>{emptyState ?? 'No data to display'}</div>
      }

      return rowsToRender.map((row, index) => {
        const rowIndex = rowsOffset + index
        const rawKey = rowKey ? rowKey(row, rowIndex) : rowIndex
        const rowKeyValue = String(rawKey)
        const isExpandable = hiddenTabletColumns.length > 0
        const isExpanded = Boolean(expandedRows[rowKeyValue])

        return (
          <div
            key={rowKeyValue}
            className={clsx(
              styles.cardRow,
              isExpandable && styles.cardRowExpandable,
              isExpanded && styles.cardRowExpanded
            )}
            role={isExpandable ? 'button' : undefined}
            tabIndex={isExpandable ? 0 : undefined}
            aria-expanded={isExpandable ? isExpanded : undefined}
            onClick={event => handleCardRowToggle(event, rowKeyValue, isExpandable)}
            onKeyDown={event => handleCardRowToggle(event, rowKeyValue, isExpandable)}
          >
            <div className={styles.tabletRowMain} style={{ gridTemplateColumns: tabletColumnsTemplate }}>
              {visibleColumns.map((column, columnIndex) => {
                const contentValue = resolveCellContent(column, row)
                const isLastColumn = columnIndex === visibleColumns.length - 1

                return (
                  <div
                    key={column.id}
                    className={clsx(
                      styles.tabletRowCell,
                      column.align === 'center' && styles.tabletRowCellAlignCenter,
                      column.align === 'right' && styles.tabletRowCellAlignRight
                    )}
                  >
                    <span className={styles.tabletRowCellContent}>{contentValue}</span>
                    {isLastColumn && isExpandable ? (
                      <span className={styles.cardRowArrow} aria-hidden='true'>
                        <ExpandArrowIcon />
                      </span>
                    ) : null}
                  </div>
                )
              })}
            </div>
            {isExpandable && isExpanded ? (
              <div className={styles.cardDetails}>
                {hiddenTabletColumns.map(column => (
                  <div key={column.id} className={styles.cardDetailsItem}>
                    <span className={styles.cardDetailsLabel}>{detailLabelForColumn(column)}</span>
                    <span className={styles.cardDetailsDots} aria-hidden='true' />
                    <span className={styles.cardDetailsValue}>{resolveCellContent(column, row)}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )
      })
    })()

    return (
      <div className={styles.tabletTable}>
        {renderTabletHeader}
        <div className={styles.tabletBody}>{content}</div>
      </div>
    )
  }

  const renderDesktopTable = () => {
    const desktopColumns = columns
    const desktopColSpan = Math.max(desktopColumns.length, 1)

    return (
      <table className={styles.table}>
        <thead>
          <tr>
            {desktopColumns.map(column => (
              <th key={column.id} style={{ textAlign: column.align ?? 'left' }}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={desktopColSpan}>
                <div className={styles.loadingState}>
                  <Spinner />
                </div>
              </td>
            </tr>
          ) : rowsToRender.length === 0 ? (
            <tr>
              <td colSpan={desktopColSpan}>
                <div className={styles.emptyState}>{emptyState ?? 'No data to display'}</div>
              </td>
            </tr>
          ) : (
            rowsToRender.map((row, index) => {
              const rowIndex = rowsOffset + index
              const key = rowKey ? rowKey(row, rowIndex) : `${rowIndex}`
              return (
                <tr key={key}>
                  {desktopColumns.map(column => (
                    <td key={column.id} style={{ textAlign: column.align ?? 'left' }}>
                      {resolveCellContent(column, row)}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    )
  }

  // const searchInputNode = searchConfig ? (
  //   <div className={clsx(styles.searchBar, isMobileLayout && styles.mobileSearchBar)}>
  //     <TableSearchInput
  //       icon={searchConfig.icon}
  //       onSearch={searchConfig.onSearch}
  //       placeholder={searchConfig.placeholder}
  //       className={clsx(isMobileLayout && styles.mobileSearchInput)}
  //     />
  //   </div>
  // ) : null

  const filtersTriggerNode = filtersTrigger ? (
    <button
      type='button'
      className={clsx(
        styles.filtersTriggerButton,
        isMobileLayout && styles.mobileFiltersTriggerButton,
        filtersTrigger.isActive && styles.filtersTriggerButtonActive
      )}
      onClick={filtersTrigger.onClick}
    >
      {filtersTrigger.icon ? <span className={styles.filtersTriggerIcon}>{filtersTrigger.icon}</span> : null}
      <span>{filtersTrigger.label}</span>
      {filtersTrigger.count ? <span>({filtersTrigger.count})</span> : null}
    </button>
  ) : null

  const paginationNode = pagination ? (
    <Pagination
      totalItems={pagination.totalItems}
      dataLength={data.length}
      currentPage={pagination.currentPage}
      pageSize={pagination.pageSize}
      onPageChange={pagination.onPageChange}
      onPageSizeChange={pagination.onPageSizeChange}
      pageSizeOptions={pagination.pageSizeOptions}
      showSummary={pagination.showSummary}
      mode={pagination.mode}
    />
  ) : null

  if (isMobileLayout) {
    const showMobileHeader = Boolean(title) || Boolean(filtersTriggerNode)

    return (
      <div className={clsx(tableClassName, styles.wrapperMobile)}>
        {showMobileHeader ? (
          <div className={styles.mobileHeader}>
            {title ? <h3 className={clsx(styles.title, styles.mobileTitle)}>{title}</h3> : null}
            {filtersTriggerNode}
          </div>
        ) : null}
        <div className={styles.mobileBody}>
          {/* {searchInputNode ? <div className={styles.mobileSearch}>{searchInputNode}</div> : null} */}
          {renderMobileTable()}
        </div>
        {paginationNode}
      </div>
    )
  }

  return (
    <div className={tableClassName}>
      <div className={styles.header}>
        {title ? <h3 className={styles.title}>{title}</h3> : null}
        {showToolbar ? (
          <div className={styles.toolbar}>
            {/* {searchInputNode} */}
            {filtersTriggerNode}
          </div>
        ) : null}
      </div>

      <div className={styles.tableContainer}>{isTabletLayout ? renderTabletTable() : renderDesktopTable()}</div>
      {paginationNode}
    </div>
  )
}
