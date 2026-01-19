import React, { useEffect, useRef, useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { $lpOTC } from '../model/lp-fideumOTC'
import styles from './LPSearch.module.scss'

interface LPSearchProps {
  value: string
  onChange: (value: string) => void
  onSelect: (lp: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
  showClearButton?: boolean
}

export function LPSearch({
  value,
  onChange,
  onSelect,
  error,
  disabled,
  placeholder = 'Search liquidity provider',
  showClearButton = false,
}: LPSearchProps) {
  const lps = useUnit($lpOTC)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Фильтрация LP по поисковому запросу
  const filteredLPs = lps.filter(lp => lp.toLowerCase().includes(searchTerm.toLowerCase()))

  // Обработка клика вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectLP = (lp: string) => {
    onChange(lp)
    onSelect(lp)
    setSearchTerm(lp)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleClear = () => {
    onChange('')
    setSearchTerm('')
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  // Обработка клавиатуры
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < filteredLPs.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredLPs.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && filteredLPs[selectedIndex]) {
          handleSelectLP(filteredLPs[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    onChange(newValue)
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true)
      setSearchTerm(value)
    }
  }

  const getDisplayValue = () => {
    if (!value) return ''
    return searchTerm || value
  }

  return (
    <div className={styles.lpSearchContainer}>
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type='text'
          value={getDisplayValue()}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className={clsx(styles.input, error && styles.error)}
          placeholder={placeholder}
          disabled={disabled}
        />
        <div className={styles.inputActions}>
          {showClearButton && value && (
            <button type='button' onClick={handleClear} className={styles.clearButton} disabled={disabled}>
              ✕
            </button>
          )}
          <div className={styles.dropdownArrow}>▼</div>
        </div>
      </div>

      {error && <span className={styles.errorMessage}>{error}</span>}

      {isOpen && (
        <div ref={dropdownRef} className={styles.dropdown}>
          {filteredLPs.length > 0 ? (
            <div className={styles.lpList}>
              {filteredLPs.map((lp, index) => (
                <div
                  key={lp}
                  className={clsx(styles.lpItem, index === selectedIndex && styles.selected)}
                  onClick={() => handleSelectLP(lp)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className={styles.lpInfo}>
                    <div className={styles.lpName}>{lp}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>🔍</div>
              <div className={styles.noResultsText}>
                {lps.length === 0 ? 'No liquidity providers available' : 'No providers found'}
              </div>
              {lps.length === 0 && <div className={styles.noResultsSubtext}>Please add providers first</div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
