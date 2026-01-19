import { ReactNode } from 'react'

import { TableColumn } from './types'

export function resolveCellContent<T extends Record<string, unknown>>(column: TableColumn<T>, row: T) {
  if (column.render) {
    return column.render(row)
  }

  if (column.dataKey) {
    return row[column.dataKey] as ReactNode
  }

  return row[column.id as keyof T] as ReactNode
}

export function hasRenderableValue(value: ReactNode) {
  if (value === null || value === undefined || value === false) {
    return false
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  return true
}
