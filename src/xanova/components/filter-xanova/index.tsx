import { useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'

import styles from './styles.module.scss'
import { StatusPill } from 'xanova/components/status-pill'

export type FilterXanovaOption = {
  id: string
  label: string
  value?: string
  checked?: boolean
  disabled?: boolean
  className?: string
}

export type FilterXanovaSelectOption = {
  value: string
  label: string
}

export type FilterXanovaSection =
  | {
      id: string
      title: string
      type: 'checkbox'
      options: FilterXanovaOption[]
    }
  | {
      id: string
      title: string
      type: 'select'
      options: FilterXanovaSelectOption[]
      placeholder?: string
    }
  | {
      id: string
      title: string
      type: 'date'
      placeholder?: string
      value?: {
        from?: string | null
        to?: string | null
      }
    }

export type FilterXanovaConfig = {
  title: string
  sections: FilterXanovaSection[]
  applyLabel?: string
  onApply?: (values: Record<string, string[]>) => void
  onClear?: () => void
}

type FilterXanovaProps = {
  config: FilterXanovaConfig
}

const getCheckboxValue = (option: FilterXanovaOption) => option.value ?? option.id

const buildInitialCheckboxState = (sections: FilterXanovaSection[]) => {
  const state: Record<string, Set<string>> = {}

  sections.forEach(section => {
    if (section.type !== 'checkbox') {
      return
    }

    const selected = section.options.filter(option => option.checked).map(option => getCheckboxValue(option))

    state[section.id] = new Set(selected)
  })

  return state
}

const buildInitialDateState = (sections: FilterXanovaSection[]) => {
  const state: Record<string, { from: string; to: string }> = {}

  sections.forEach(section => {
    if (section.type !== 'date') {
      return
    }

    const from = section.value?.from ?? ''
    const to = section.value?.to ?? ''

    state[section.id] = { from, to }
  })

  return state
}

function renderSection(
  section: FilterXanovaSection,
  checkboxState: Record<string, Set<string>>,
  onCheckboxToggle: (sectionId: string, value: string) => void,
  dateState: Record<string, { from: string; to: string }>,
  onDateChange: (sectionId: string, key: 'from' | 'to', value: string) => void
) {
  if (section.type === 'checkbox') {
    if (section.id === 'status') {
      return (
        <div className={styles.checkboxGroup}>
          {section.options.map(option => (
            <label
              key={option.id}
              className={clsx('checkbox-wrap-xanova', styles.checkboxWrap, option.className, {
                disabled: option.disabled,
              })}
            >
              <input
                type='checkbox'
                checked={checkboxState[section.id]?.has(getCheckboxValue(option)) ?? false}
                disabled={option.disabled}
                onChange={() => onCheckboxToggle(section.id, getCheckboxValue(option))}
              />
              <span className='checkbox-xanova-box' />
              <StatusPill status={option.label} className={styles.statusPill} />
            </label>
          ))}
        </div>
      )
    }

    return (
      <div className={styles.checkboxGroup}>
        {section.options.map(option => (
          <label
            key={option.id}
            className={clsx('checkbox-wrap-xanova', styles.checkboxWrap, option.className, {
              disabled: option.disabled,
            })}
          >
            <input
              type='checkbox'
              checked={checkboxState[section.id]?.has(getCheckboxValue(option)) ?? false}
              disabled={option.disabled}
              onChange={() => onCheckboxToggle(section.id, getCheckboxValue(option))}
            />
            <span className='checkbox-xanova-box' />
            <span className='checkbox-xanova-text text-16'>{option.label}</span>
          </label>
        ))}
      </div>
    )
  }

  if (section.type === 'select') {
    return (
      <div className='select-wrap-xanova'>
        <select defaultValue='' required>
          <option value='' disabled hidden>
            {section.placeholder ?? 'Select option'}
          </option>
          {section.options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (section.type === 'date') {
    const fromInputId = `${section.id}-from`
    const toInputId = `${section.id}-to`
    const placeholder = section.placeholder ?? 'DD/MM/YYYY'
    const value = dateState[section.id] ?? { from: '', to: '' }

    return (
      <div className={styles.dateRangeGroup}>
        <div className='input-wrap-xanova with-icon'>
          <label htmlFor={fromInputId}>From</label>
          <input
            id={fromInputId}
            type='date'
            placeholder={placeholder}
            value={value.from}
            onChange={event => onDateChange(section.id, 'from', event.target.value)}
          />
        </div>
        <div className='input-wrap-xanova with-icon'>
          <label htmlFor={toInputId}>To</label>
          <input
            id={toInputId}
            type='date'
            placeholder={placeholder}
            value={value.to}
            onChange={event => onDateChange(section.id, 'to', event.target.value)}
          />
        </div>
      </div>
    )
  }

  return null
}

export function FilterXanova({ config }: FilterXanovaProps) {
  const [checkboxState, setCheckboxState] = useState<Record<string, Set<string>>>(
    buildInitialCheckboxState(config.sections)
  )
  const [dateState, setDateState] = useState<Record<string, { from: string; to: string }>>(
    buildInitialDateState(config.sections)
  )

  useEffect(() => {
    setCheckboxState(buildInitialCheckboxState(config.sections))
    setDateState(buildInitialDateState(config.sections))
  }, [config.sections])

  const handleCheckboxToggle = useCallback((sectionId: string, value: string) => {
    setCheckboxState(prev => {
      const currentValues = prev[sectionId] ?? new Set<string>()
      const nextValues = new Set(currentValues)

      if (nextValues.has(value)) {
        nextValues.delete(value)
      } else {
        nextValues.add(value)
      }

      return { ...prev, [sectionId]: nextValues }
    })
  }, [])

  const handleDateChange = useCallback((sectionId: string, key: 'from' | 'to', value: string) => {
    setDateState(prev => {
      const current = prev[sectionId] ?? { from: '', to: '' }

      return {
        ...prev,
        [sectionId]: {
          ...current,
          [key]: value,
        },
      }
    })
  }, [])

  const handleApply = () => {
    if (!config.onApply) {
      return
    }

    const result: Record<string, string[]> = {}

    Object.entries(checkboxState).forEach(([sectionId, values]) => {
      result[sectionId] = Array.from(values)
    })

    Object.entries(dateState).forEach(([sectionId, value]) => {
      result[sectionId] = [value.from ?? '', value.to ?? '']
    })

    config.onApply(result)
  }

  const clearFilters = () => {
    config.onClear && config.onClear()
  }

  const renderedSections = useMemo(() => {
    return config.sections.map(section => (
      <div key={section.id} className={clsx(styles.section, section.id === 'date-range' && styles.dateRangeSection)}>
        <h3 className={styles.sectionTitle}>{section.title}</h3>
        {renderSection(section, checkboxState, handleCheckboxToggle, dateState, handleDateChange)}
      </div>
    ))
  }, [config.sections, checkboxState, handleCheckboxToggle, dateState, handleDateChange])

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{config.title}</h2>
      <div className={styles.sections}>{renderedSections}</div>
      <div className={styles.actions}>
        <button type='button' className='btn-xanova big gold' onClick={handleApply}>
          {config.applyLabel ?? 'Apply'}
        </button>
        <button type='button' className='btn-with-icon-xanova grey width100 big' onClick={clearFilters}>
          Clear All Filters
        </button>
      </div>
    </div>
  )
}
