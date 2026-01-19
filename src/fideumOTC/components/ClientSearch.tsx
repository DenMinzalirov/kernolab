import React, { useEffect, useRef, useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { OTCClient } from '../../wip/services/fideumOTC-services/OTC-trade'
import { $clientsForSearch, loadAllClientsForSearch, searchClients, searchClientsFx } from '../model/clients-fideumOTC'
import styles from './ClientSearch.module.scss'

interface ClientSearchProps {
  value: string
  onChange: (value: string) => void
  onSelect: (client: OTCClient | null) => void
  error?: string
  disabled?: boolean
  placeholder?: string
  showClearButton?: boolean
}

export function ClientSearch({
  value,
  onChange,
  onSelect,
  error,
  disabled,
  placeholder = 'Search client by email, name or ID',
  showClearButton = false,
}: ClientSearchProps) {
  const clients = useUnit($clientsForSearch)
  const isSearching = useUnit(searchClientsFx.pending)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Загружаем все клиенты при монтировании компонента
  useEffect(() => {
    loadAllClientsForSearch()
  }, [])

  // Клиенты уже отфильтрованы на сервере по email и fullName
  const filteredClients = clients

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

  const handleSelectClient = (client: OTCClient) => {
    const displayValue = `${client.email}`
    onChange(displayValue)
    onSelect(client)
    setSearchTerm(displayValue)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleClear = () => {
    onChange('')
    setSearchTerm('')
    onSelect(null)
    setIsOpen(false)
    setSelectedIndex(-1)

    // Очищаем таймер поиска если он есть
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Загружаем все клиенты заново
    loadAllClientsForSearch()
  }

  // Обработка клавиатуры
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < filteredClients.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredClients.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && filteredClients[selectedIndex]) {
          handleSelectClient(filteredClients[selectedIndex])
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

    // Очищаем предыдущий таймер
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Устанавливаем новый таймер для дебаунса (300ms)
    searchTimeoutRef.current = setTimeout(() => {
      searchClients(newValue.trim())
    }, 300)
  }

  // Очищаем таймер при размонтировании компонента
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

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
    <div className={styles.clientSearchContainer}>
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
          {isSearching ? (
            <div className={styles.noResults}>
              <div className={styles.loadingSpinner}>⏳</div>
              <div className={styles.noResultsText}>Searching...</div>
            </div>
          ) : filteredClients.length > 0 ? (
            <div className={styles.clientList}>
              {filteredClients.map((client, index) => (
                <div
                  key={client.clientUuid}
                  className={clsx(styles.clientItem, index === selectedIndex && styles.selected)}
                  onClick={() => handleSelectClient(client)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className={styles.clientInfo}>
                    <div className={styles.clientEmail}>{client.email}</div>
                    <div className={styles.clientDetails}>
                      <span className={styles.clientName}>{client.fullName}</span>
                      <span className={styles.clientId}>ID: {client.applicantId}</span>
                    </div>
                  </div>
                  <div className={styles.clientStatus}>
                    <span className={clsx(styles.statusBadge, styles[`status${client.status}`])}>{client.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>🔍</div>
              <div className={styles.noResultsText}>
                {clients.length === 0 ? 'No clients available' : 'No clients found'}
              </div>
              {clients.length === 0 && <div className={styles.noResultsSubtext}>Please add clients first</div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
