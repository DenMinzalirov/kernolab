import { useMemo } from 'react'

import { TableColumn } from './types'

type MobileColumnsResult<T> = {
  primaryMobileColumn: TableColumn<T> | null
  secondaryMobileColumn: TableColumn<T> | null
  statusMobileColumn: TableColumn<T> | null
  collapsedMobileColumn: TableColumn<T> | null
  detailMobileColumns: Array<TableColumn<T>>
}

export function useMobileColumns<T extends Record<string, unknown>>(
  columns: Array<TableColumn<T>>,
  isMobileLayout: boolean
): MobileColumnsResult<T> {
  return useMemo(() => {
    if (!isMobileLayout) {
      return {
        primaryMobileColumn: null,
        secondaryMobileColumn: null,
        statusMobileColumn: null,
        collapsedMobileColumn: null,
        detailMobileColumns: [],
      }
    }

    const visibleCandidates = columns.filter(column => {
      const mobileConfig = column.responsive?.mobile
      if (mobileConfig?.slot === 'collapsed') {
        return false
      }

      return !mobileConfig?.hidden
    })

    const primaryColumn =
      visibleCandidates.find(column => column.responsive?.mobile?.slot === 'primary') ?? visibleCandidates[0] ?? null

    let secondaryColumn =
      visibleCandidates.find(
        column => column.responsive?.mobile?.slot === 'secondary' && column.id !== primaryColumn?.id
      ) ?? null

    if (!secondaryColumn) {
      secondaryColumn =
        visibleCandidates.find(
          column => column.id !== primaryColumn?.id && column.responsive?.mobile?.slot !== 'status'
        ) ?? null
    }

    const statusColumn =
      visibleCandidates.find(
        column =>
          column.responsive?.mobile?.slot === 'status' &&
          column.id !== primaryColumn?.id &&
          column.id !== secondaryColumn?.id
      ) ?? null

    const collapsedColumn = columns.find(column => column.responsive?.mobile?.slot === 'collapsed') ?? null

    const assignedIds = new Set<string>()
    if (primaryColumn) {
      assignedIds.add(primaryColumn.id)
    }
    if (secondaryColumn) {
      assignedIds.add(secondaryColumn.id)
    }
    if (statusColumn) {
      assignedIds.add(statusColumn.id)
    }
    if (collapsedColumn) {
      assignedIds.add(collapsedColumn.id)
    }

    const detailColumns = columns.filter(column => {
      const mobileConfig = column.responsive?.mobile
      if (mobileConfig?.slot === 'collapsed') {
        return false
      }
      if (mobileConfig?.hidden) {
        return true
      }

      return !assignedIds.has(column.id)
    })

    return {
      primaryMobileColumn: primaryColumn,
      secondaryMobileColumn: secondaryColumn,
      statusMobileColumn: statusColumn,
      collapsedMobileColumn: collapsedColumn,
      detailMobileColumns: detailColumns,
    }
  }, [columns, isMobileLayout])
}
