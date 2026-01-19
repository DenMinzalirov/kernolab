import React, { useEffect, useRef, useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { B2C2CombinedInstrumentResponse } from '../../wip/services/fideumOTC-services/OTC-trade'
import { $instrumentsOTC } from '../model/insruments-B2C2-fideumOTC'
import styles from './InstrumentSearch.module.scss'

interface InstrumentSearchProps {
  value: string
  onChange: (value: string) => void
  onSelect: (instrument: B2C2CombinedInstrumentResponse) => void
  error?: string
  disabled?: boolean
  placeholder?: string
  showClearButton?: boolean
}

export function InstrumentSearch({
  value,
  onChange,
  onSelect,
  error,
  disabled,
  placeholder = 'Search instrument by name or symbol',
  showClearButton = false,
}: InstrumentSearchProps) {
  const instruments = useUnit($instrumentsOTC)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Фильтрация инструментов по поисковому запросу
  const filteredInstruments = instruments.filter(
    instrument =>
      instrument.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instrument.b2c2Name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const handleSelectInstrument = (instrument: B2C2CombinedInstrumentResponse) => {
    const displayValue = `${instrument.name}`
    onChange(displayValue)
    onSelect(instrument)
    setSearchTerm(displayValue)
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
        setSelectedIndex(prev => (prev < filteredInstruments.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredInstruments.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && filteredInstruments[selectedIndex]) {
          handleSelectInstrument(filteredInstruments[selectedIndex])
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
    <div className={styles.instrumentSearchContainer}>
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
          {filteredInstruments.length > 0 ? (
            <div className={styles.instrumentList}>
              {filteredInstruments.map((instrument, index) => (
                <div
                  key={instrument.b2c2Name}
                  className={clsx(styles.instrumentItem, index === selectedIndex && styles.selected)}
                  onClick={() => handleSelectInstrument(instrument)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className={styles.instrumentInfo}>
                    <div className={styles.instrumentName}>{instrument.name}</div>
                    <div className={styles.instrumentDetails}>
                      <span className={styles.instrumentSymbol}>Symbol: {instrument.b2c2Name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>🔍</div>
              <div className={styles.noResultsText}>
                {instruments.length === 0 ? 'No instruments available' : 'No instruments found'}
              </div>
              {instruments.length === 0 && <div className={styles.noResultsSubtext}>Please add instruments first</div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
