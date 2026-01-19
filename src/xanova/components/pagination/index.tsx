import { type ChangeEvent } from 'react'
import clsx from 'clsx'

import styles from './styles.module.scss'

type PaginationMode = 'client' | 'server'

const MAX_VISIBLE_BUTTONS = 5
const START_ELLIPSIS = 'start-ellipsis'
const END_ELLIPSIS = 'end-ellipsis'

const PaginationArrowIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg
    className={styles.paginationIcon}
    width='16'
    height='16'
    viewBox='0 0 16 16'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M9.7468 3.5L6.3457 8L9.7468 12.5'
      stroke='currentColor'
      strokeWidth='1.12723'
      strokeLinecap='round'
      strokeLinejoin='round'
      transform={direction === 'right' ? 'rotate(180 8 8)' : undefined}
    />
  </svg>
)

export type PaginationProps = {
  className?: string
  totalItems?: number
  dataLength: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  showSummary?: boolean
  mode?: PaginationMode
  pageSizeLabel?: string
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const buildPageList = (current: number, total: number) => {
  if (total <= MAX_VISIBLE_BUTTONS) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const halfRange = Math.floor(MAX_VISIBLE_BUTTONS / 2)
  let start = current - halfRange
  let end = current + halfRange

  if (start < 1) {
    start = 1
    end = MAX_VISIBLE_BUTTONS
  } else if (end > total) {
    end = total
    start = total - MAX_VISIBLE_BUTTONS + 1
  }

  const pages: Array<number | string> = []

  if (start > 1) {
    pages.push(1)
    if (start > 2) {
      pages.push(START_ELLIPSIS)
    }
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  if (end < total) {
    if (end < total - 1) {
      pages.push(END_ELLIPSIS)
    }
    pages.push(total)
  }

  return pages
}

export function Pagination({
  className,
  totalItems,
  dataLength,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [],
  showSummary = true,
  mode = 'client',
  pageSizeLabel = 'Rows per page',
}: PaginationProps) {
  const fallbackTotalItems = mode === 'server' && typeof totalItems === 'number' ? totalItems : dataLength
  const totalItemsValue = totalItems ?? fallbackTotalItems

  if (totalItemsValue === 0) {
    return null
  }

  const totalPages = Math.max(1, Math.ceil(totalItemsValue / pageSize))
  const showSummaryBlock = showSummary && totalItemsValue > 0
  const hasPageSizeControl = pageSizeOptions.length > 0 && typeof onPageSizeChange === 'function'
  const showPageButtons = totalPages > 1

  if (!showSummaryBlock && !showPageButtons && !hasPageSizeControl) {
    return null
  }

  const effectiveCurrentPage = clamp(currentPage, 1, totalPages)
  const isFirstPage = effectiveCurrentPage <= 1
  const isLastPage = effectiveCurrentPage >= totalPages
  const firstItem = (effectiveCurrentPage - 1) * pageSize + 1
  const lastItem = Math.min(effectiveCurrentPage * pageSize, totalItemsValue)
  const summaryTotal = totalItems ?? totalItemsValue
  const pages = buildPageList(effectiveCurrentPage, totalPages)

  const handleChangePage = (page: number) => {
    const safePage = clamp(page, 1, totalPages)
    if (safePage !== effectiveCurrentPage) {
      onPageChange(safePage)
    }
  }

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (onPageSizeChange) {
      onPageSizeChange(Number(event.target.value))
    }
  }

  const hasMeta = showSummaryBlock || hasPageSizeControl

  return (
    <div className={clsx(styles.pagination, className)}>
      {hasMeta ? (
        <div className={styles.paginationMeta}>
          {showSummaryBlock ? (
            <div className={styles.paginationSummary}>
              Showing {firstItem}-{lastItem} of {summaryTotal}
            </div>
          ) : null}
          {hasPageSizeControl ? (
            <label className={styles.pageSizeControl}>
              <span className={styles.pageSizeLabel}>{pageSizeLabel}</span>
              <select className={styles.pageSizeSelect} value={pageSize} onChange={handlePageSizeChange}>
                {pageSizeOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      ) : null}
      {showPageButtons ? (
        <div className={styles.paginationControls}>
          <button
            type='button'
            className={clsx(styles.paginationButton, isFirstPage && styles.paginationButtonDisabled)}
            onClick={() => handleChangePage(effectiveCurrentPage - 1)}
            disabled={isFirstPage}
            aria-label='Previous page'
          >
            <PaginationArrowIcon direction='left' />
          </button>
          {pages.map(page => {
            if (typeof page === 'string') {
              return (
                <span key={page} className={styles.paginationEllipsis}>
                  &hellip;
                </span>
              )
            }

            const isActive = page === effectiveCurrentPage

            return (
              <button
                type='button'
                key={page}
                className={clsx(
                  styles.paginationButton,
                  styles.paginationButtonNumber,
                  isActive && styles.paginationButtonActive
                )}
                onClick={() => handleChangePage(page)}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            )
          })}
          <button
            type='button'
            className={clsx(styles.paginationButton, isLastPage && styles.paginationButtonDisabled)}
            onClick={() => handleChangePage(effectiveCurrentPage + 1)}
            disabled={isLastPage}
            aria-label='Next page'
          >
            <PaginationArrowIcon direction='right' />
          </button>
        </div>
      ) : null}
    </div>
  )
}
