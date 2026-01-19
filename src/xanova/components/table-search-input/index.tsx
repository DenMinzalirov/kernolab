import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

import styles from './styles.module.scss'

type TableSearchInputProps = {
  placeholder?: string
  icon?: ReactNode
  onSearch: (value: string) => void
  className?: string
}

export const TableSearchInput = ({ placeholder, icon, onSearch, className }: TableSearchInputProps) => {
  const [value, setValue] = useState('')
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value
      setValue(nextValue)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        onSearch(nextValue)
      }, 300)
    },
    [onSearch]
  )

  return (
    <div className={clsx(styles.searchInput, className)}>
      {icon ? <span className={styles.searchInputIcon}>{icon}</span> : null}
      <input
        className={styles.searchInputField}
        placeholder={placeholder ?? 'Search...'}
        value={value}
        onChange={handleChange}
        spellCheck={false}
      />
    </div>
  )
}
