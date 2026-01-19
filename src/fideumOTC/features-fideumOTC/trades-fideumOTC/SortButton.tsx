import React from 'react'
import clsx from 'clsx'

import styles from './styles.module.scss'

export type SortDirection = 'asc' | 'desc' | null

interface SortButtonProps {
  currentSort?: SortDirection
  onSortChange: (direction: SortDirection) => void
}

export const SortButton: React.FC<SortButtonProps> = ({ currentSort, onSortChange }) => {
  const handleClick = () => {
    // Цикл: null -> asc -> desc -> null
    if (currentSort === null) {
      onSortChange('asc')
    } else if (currentSort === 'asc') {
      onSortChange('desc')
    } else {
      onSortChange(null)
    }
  }

  return (
    <button
      className={clsx(styles.sortButton)}
      onClick={handleClick}
      type='button'
      aria-label={`Sort ${currentSort || 'unsorted'}`}
    >
      <div className={styles.sortIcon}>
        {/* Стрелка вверх */}
        <div className={clsx(styles.sortArrow, styles.sortArrowUp, currentSort === 'asc' && styles.sortArrowActive)} />
        {/* Стрелка вниз */}
        <div
          className={clsx(styles.sortArrow, styles.sortArrowDown, currentSort === 'desc' && styles.sortArrowActive)}
        />
      </div>
    </button>
  )
}
