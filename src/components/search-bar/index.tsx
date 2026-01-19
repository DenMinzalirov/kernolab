import { useCallback, useRef, useState } from 'react'

import { SearchIconBiz } from 'icons/search-icon-biz'
import searchIconSvg from 'assets/icons/history/search-icon.svg'

import { isBiz } from '../../config'
import styles from './styles.module.scss'

type Props = {
  onChange: (text: string) => void
}

export const SearchBar = ({ onChange }: Props) => {
  const textInputRef = useRef<HTMLInputElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [value, setValue] = useState<string>('')

  const handleFocus = () => {
    if (textInputRef.current) {
      textInputRef.current.focus()
    }
  }

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        onChange(newValue)
      }, 500)
    },
    [onChange]
  )

  return (
    <div className={isBiz ? styles.searchBarBiz : styles.searchBar} onClick={handleFocus}>
      <div className={isBiz ? styles.searchBarIconBiz : styles.searchBarIcon}>
        {isBiz ? <SearchIconBiz /> : <img alt='Search icon' src={searchIconSvg} />}
      </div>
      <input
        ref={textInputRef}
        className={isBiz ? styles.searchBarBizInput : styles.searchBarInput}
        placeholder='Search...'
        value={value}
        onChange={handleChange}
      />
    </div>
  )
}
