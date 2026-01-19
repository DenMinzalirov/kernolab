import { ReactNode } from 'react'

type ResponsiveSlot = 'primary' | 'secondary' | 'status' | 'collapsed'

type ResponsiveValueResolver<T> = keyof T | ((row: T) => ReactNode)

export type TableColumnResponsiveConfig<T> = {
  tablet?: {
    hidden?: boolean
    label?: string
  }
  mobile?: {
    hidden?: boolean
    label?: string
    slot?: ResponsiveSlot
    collapsedLabel?: ResponsiveValueResolver<T>
    collapsedValue?: ResponsiveValueResolver<T>
  }
}

export type TableColumn<T> = {
  id: string
  header: string
  dataKey?: keyof T
  render?: (row: T) => ReactNode
  align?: 'left' | 'center' | 'right'
  responsive?: TableColumnResponsiveConfig<T>
}

export type TableSearchConfig = {
  placeholder?: string
  onSearch: (value: string) => void
  icon?: ReactNode
}

export type TableFiltersTrigger = {
  label: string
  onClick: () => void
  icon?: ReactNode
  count?: number
  isActive?: boolean
}

export type TablePaginationConfig = {
  totalItems: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  showSummary?: boolean
  mode?: 'client' | 'server'
}

export type DataTableProps<T extends Record<string, unknown>> = {
  title?: string
  columns: Array<TableColumn<T>>
  data: T[]
  isLoading?: boolean
  emptyState?: ReactNode
  rowKey?: (row: T, index: number) => string | number
  searchConfig?: TableSearchConfig
  filtersTrigger?: TableFiltersTrigger
  pagination?: TablePaginationConfig
  className?: string
  disableTabletReflow?: boolean
  disableMobileReflow?: boolean
}
