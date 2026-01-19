import React, { useEffect, useState } from 'react'
import { useUnit } from 'effector-react'

import { Modal } from '../../../components'
import { OTCClient } from '../../../wip/services/fideumOTC-services/OTC-trade'
import { B2C2CombinedInstrumentResponse } from '../../../wip/services/fideumOTC-services/OTC-trade'
import { ClientSearch, InstrumentSearch, LPSearch, SideFilter, StatusFilter } from '../../components'
import { $clientsOTC } from '../../model/clients-fideumOTC'
import { $filters, filtersChangedEv, filtersClearedEv, FilterState } from '../../model/filters-fideumOTC'
import styles from './styles.module.scss'

export function TableFilters() {
  const clients = useUnit($clientsOTC)

  const globalFilters = useUnit($filters)

  // Локальное состояние фильтров для работы в модальном окне
  const [localFilters, setLocalFilters] = useState<FilterState>(globalFilters)

  // Локальное состояние для отображения выбранных значений
  const [clientDisplayValue, setClientDisplayValue] = useState('')
  const [lpDisplayValue, setLpDisplayValue] = useState('')
  const [instrumentDisplayValue, setInstrumentDisplayValue] = useState('')
  const [statusDisplayValue, setStatusDisplayValue] = useState('')
  const [sideDisplayValue, setSideDisplayValue] = useState('')

  // Инициализация локального состояния при открытии модального окна
  useEffect(() => {
    if (globalFilters.clientUuid) {
      const client = clients.find(clientData => globalFilters.clientUuid === clientData.clientUuid)
      client && setClientDisplayValue(client.email)
    }
    if (globalFilters.liquidityProvider) {
      setLpDisplayValue(globalFilters.liquidityProvider)
    }
    if (globalFilters.instrument) {
      // const instrument = instruments.find(instrumentItem => instrumentItem.name === globalFilters.instrument)
      // instrument &&
      setInstrumentDisplayValue(globalFilters.instrument)
    }
    if (globalFilters.status) {
      setStatusDisplayValue(globalFilters.status)
    }
    if (globalFilters.side) {
      setSideDisplayValue(globalFilters.side)
    }
    setLocalFilters(globalFilters)
  }, [globalFilters])

  const handleDateChange = (field: keyof FilterState, value: string) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleClientSelect = (client: OTCClient | null) => {
    setLocalFilters(prev => ({ ...prev, clientUuid: client?.clientUuid }))
  }

  const handleClientChange = (value: string) => {
    setClientDisplayValue(value)
    if (!value) {
      setLocalFilters(prev => ({ ...prev, clientUuid: '' }))
    }
  }

  const handleLPSelect = (lp: string) => {
    setLocalFilters(prev => ({ ...prev, liquidityProvider: lp }))
  }

  const handleLPChange = (value: string) => {
    setLpDisplayValue(value)
    if (!value) {
      setLocalFilters(prev => ({ ...prev, liquidityProvider: '' }))
    }
  }

  const handleInstrumentSelect = (instrument: B2C2CombinedInstrumentResponse) => {
    setLocalFilters(prev => ({ ...prev, instrument: instrument.name }))
  }

  const handleInstrumentChange = (value: string) => {
    setInstrumentDisplayValue(value)
    if (!value) {
      setLocalFilters(prev => ({ ...prev, instrument: '' }))
    }
  }

  const handleStatusSelect = (status: string) => {
    setLocalFilters(prev => ({ ...prev, status: status }))
  }

  const handleStatusChange = (value: string) => {
    setStatusDisplayValue(value)
    if (!value) {
      setLocalFilters(prev => ({ ...prev, status: '' }))
    }
  }

  const handleSideSelect = (side: string) => {
    setLocalFilters(prev => ({ ...prev, side: side as 'BUY' | 'SELL' }))
  }

  const handleSideChange = (value: string) => {
    setSideDisplayValue(value)
    if (!value) {
      setLocalFilters(prev => ({ ...prev, side: '' as 'BUY' | 'SELL' | '' }))
    }
  }

  // Применение фильтров к глобальному состоянию
  const applyFilters = () => {
    filtersChangedEv({ ...localFilters, page: 0 })
    Modal.close()
  }

  // Сброс фильтров
  const clearFilters = () => {
    const clearedFilters: FilterState = {
      clientUuid: '',
      liquidityProvider: '',
      instrument: '',
      side: '',
      status: '',
      createdAtFrom: '',
      createdAtTo: '',
      sort: '',
      page: 0,
    }

    setLocalFilters(clearedFilters)
    setClientDisplayValue('')
    setLpDisplayValue('')
    setInstrumentDisplayValue('')
    setStatusDisplayValue('')
    setSideDisplayValue('')
  }

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filtersRow}>
        {/* Client Search */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Client</label>
          <ClientSearch
            value={clientDisplayValue}
            onChange={handleClientChange}
            onSelect={handleClientSelect}
            placeholder='Search client by email, name or ID'
            showClearButton={true}
          />
        </div>

        {/* Liquidity Provider */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Liquidity Provider</label>
          <LPSearch
            value={lpDisplayValue}
            onChange={handleLPChange}
            onSelect={handleLPSelect}
            placeholder='Search liquidity provider'
            showClearButton={true}
          />
        </div>

        {/* Instrument */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Instrument</label>
          <InstrumentSearch
            value={instrumentDisplayValue}
            onChange={handleInstrumentChange}
            onSelect={handleInstrumentSelect}
            placeholder='Search instrument by name or symbol'
            showClearButton={true}
          />
        </div>

        {/* Side */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Side</label>
          <SideFilter
            value={sideDisplayValue}
            onChange={handleSideChange}
            onSelect={handleSideSelect}
            placeholder='Select side'
            showClearButton={true}
          />
        </div>

        {/* Status */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Status</label>
          <StatusFilter
            value={statusDisplayValue}
            onChange={handleStatusChange}
            onSelect={handleStatusSelect}
            placeholder='Select status'
            showClearButton={true}
          />
        </div>

        {/* Created At Date Range */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Created Date</label>
          <div className={styles.dateRangeGroup}>
            <input
              type='date'
              value={localFilters.createdAtFrom || ''}
              onChange={e => handleDateChange('createdAtFrom', e.target.value)}
              placeholder='From'
              className={styles.filterInput}
            />
            <span className={styles.dateSeparator}>to</span>
            <input
              type='date'
              value={localFilters.createdAtTo || ''}
              onChange={e => handleDateChange('createdAtTo', e.target.value)}
              placeholder='To'
              className={styles.filterInput}
            />
          </div>
        </div>
      </div>

      <div style={{ margin: 10, display: 'flex', gap: 10 }}>
        <button onClick={applyFilters} className={'btn-biz blue'}>
          Apply
        </button>
        <button onClick={clearFilters} className={'btn-biz grey'}>
          Clear
        </button>
      </div>
    </div>
  )
}
