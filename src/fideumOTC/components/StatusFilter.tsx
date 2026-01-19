import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

import { OTCStatus } from '../../wip/services/fideumOTC-services/OTC-trade'
import { getStatusBadgeStyle, getStatusText } from '../features-fideumOTC/trades-fideumOTC/utils'
import styles from './StatusFilter.module.scss'

interface StatusFilterProps {
  value: string
  onChange: (value: string) => void
  onSelect: (status: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
  showClearButton?: boolean
}

export function StatusFilter({
  value,
  onChange,
  onSelect,
  error,
  disabled,
  placeholder = 'Select status',
  showClearButton = false,
}: StatusFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Все доступные статусы
  const statuses = Object.values(OTCStatus)

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

  const handleSelectStatus = (status: string) => {
    onChange(status)
    onSelect(status)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleClear = () => {
    onChange('')
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  // Обработка клавиатуры
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < statuses.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : statuses.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && statuses[selectedIndex]) {
          handleSelectStatus(statuses[selectedIndex])
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
    onChange(newValue)
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true)
    }
  }

  const getDisplayValue = () => {
    return value || ''
  }

  return (
    <div className={styles.statusFilterContainer}>
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
          <div className={styles.statusList}>
            {statuses.map((status, index) => {
              if (status === OTCStatus.CREATED) return null

              return (
                <div
                  key={status}
                  className={clsx(styles.statusItem, index === selectedIndex && styles.selected)}
                  onClick={() => handleSelectStatus(status)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className={styles.statusBadgeWrap}>
                    <div className={clsx(styles.statusBadge, styles[getStatusBadgeStyle(status)])}>
                      {getStatusText(status)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
