import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

import styles from './SideFilter.module.scss'

interface SideFilterProps {
  value: string
  onChange: (value: string) => void
  onSelect: (side: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
  showClearButton?: boolean
}

export function SideFilter({
  value,
  onChange,
  onSelect,
  error,
  disabled,
  placeholder = 'Select side',
  showClearButton = false,
}: SideFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Доступные стороны сделки
  const sides = ['BUY', 'SELL']

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

  const handleSelectSide = (side: string) => {
    onChange(side)
    onSelect(side)
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
        setSelectedIndex(prev => (prev < sides.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : sides.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && sides[selectedIndex]) {
          handleSelectSide(sides[selectedIndex])
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
    <div className={styles.sideFilterContainer}>
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
          <div className={styles.sideList}>
            {sides.map((side, index) => (
              <div
                key={side}
                className={clsx(styles.sideItem, index === selectedIndex && styles.selected)}
                onClick={() => handleSelectSide(side)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={styles.sideBadgeWrap}>
                  <div className={clsx(styles.sideBadge, styles[`side${side}`])}>{side}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
