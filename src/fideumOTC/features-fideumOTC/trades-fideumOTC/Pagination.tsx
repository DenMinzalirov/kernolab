import React from 'react'
import clsx from 'clsx'

import styles from './styles.module.scss'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, className }) => {
  // Если страниц меньше 2, не показываем пагинацию
  if (totalPages <= 1) return null

  // Генерируем массив номеров страниц для отображения
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 7 // Максимум видимых страниц

    if (totalPages <= maxVisiblePages) {
      // Если страниц мало, показываем все
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Логика для большого количества страниц
      pages.push(0) // Первая страница

      if (currentPage <= 3) {
        // Если текущая страница в начале
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages - 1)
      } else if (currentPage >= totalPages - 4) {
        // Если текущая страница в конце
        pages.push('...')
        for (let i = totalPages - 4; i < totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Если текущая страница в середине
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages - 1)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={clsx(styles.pagination, className)}>
      <div className={styles.paginationContent}>
        {/* Кнопка "Предыдущая" */}
        <button
          className={clsx(styles.paginationButton, styles.paginationButtonPrev)}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          aria-label='Previous page'
        >
          ←
        </button>

        {/* Номера страниц */}
        {pageNumbers.map(page => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${page}`} className={styles.paginationEllipsis}>
                ...
              </span>
            )
          }

          const pageNumber = page as number
          const isActive = pageNumber === currentPage

          return (
            <button
              key={pageNumber}
              className={clsx(
                styles.paginationButton,
                styles.paginationButtonNumber,
                isActive && styles.paginationButtonActive
              )}
              onClick={() => onPageChange(pageNumber)}
              aria-label={`Go to page ${pageNumber + 1}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNumber + 1}
            </button>
          )
        })}

        {/* Кнопка "Следующая" */}
        <button
          className={clsx(styles.paginationButton, styles.paginationButtonNext)}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          aria-label='Next page'
        >
          →
        </button>
      </div>
    </div>
  )
}
