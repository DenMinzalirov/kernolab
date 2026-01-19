import React, { useEffect, useState } from 'react'
import moment from 'moment'
import clsx from 'clsx'

import { Modal } from 'components'
import { MiniButton } from 'components/mini-button'
import { TITLE_TXN_HISTORY_NEW, TYPE_TXN_HISTORY } from 'features/transactions-history/constants'
import { TriangleIcon } from 'icons'

import { SearchAndList } from './search-and-list'
import styles from './styles.module.scss'

export type FilterOptionsType = {
  field: string //ASSET_TYPE or MERCHANT_TYPE, TIME, TRANSACTION_TYPE
  value: string
}
export type GroupedOptionsType = {
  [key: string]: string[]
}

type Props = {
  filterOptions: FilterOptionsType[]
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptionsType[]>>
  transactionType: string
  filterAssetId?: string
  rewardNameFilter?: string
}

const STEP = {
  FILTER: 'FILTER',
  LIST: 'LIST',
}

export const TransactionHistoryFilter = ({
  filterOptions,
  setFilterOptions,
  transactionType,
  filterAssetId,
}: Props) => {
  const [step, setStep] = useState(STEP.FILTER)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [selectedTransactionType, setSelectedTransactionType] = useState<string[]>([])
  const [selectedMerchantType, setSelectedMerchantType] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState('')

  const initializeFilterOptions = () => {
    const assetTypes: string[] = []
    const merchantType: string[] = []
    let timeFrom = ''
    let timeTo = ''
    const transactionTypes: string[] = []

    filterOptions.forEach(option => {
      switch (option.field) {
        case 'ASSET_TYPE': {
          assetTypes.push(option.value)
          break
        }
        case 'MERCHANT_TYPE': {
          merchantType.push(option.value)
          break
        }
        case 'TIME': {
          const [from, to] = option.value.split(' - ')
          timeFrom = moment(from).format('DD/MM/YY')
          timeTo = moment(to).format('DD/MM/YY')
          break
        }
        case 'TRANSACTION_TYPE': {
          transactionTypes.push(option.value)
          break
        }
        default:
          break
      }
    })

    setSelectedItems(assetTypes)
    setDateRange({ from: timeFrom, to: timeTo })
    setSelectedTransactionType(transactionTypes) // tut
    setSelectedMerchantType(merchantType)
  }

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${day}/${month}/${year}`
  }

  const checkDateButton = (from: string, to: string) => {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const lastQuarter = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

    if (from === formatDate(lastMonth) && to === formatDate(now)) {
      setSelectedDate('Last month')
    } else if (from === formatDate(lastQuarter) && to === formatDate(now)) {
      setSelectedDate('Last quarter')
    } else if (from === formatDate(lastYear) && to === formatDate(now)) {
      setSelectedDate('Last year')
    } else {
      setSelectedDate('')
    }
  }

  useEffect(() => {
    initializeFilterOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    checkDateButton(dateRange.from, dateRange.to)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange])

  const handleDateButtonPress = (label: string) => {
    setSelectedDate(prev => (prev === label ? '' : label))

    if (selectedDate === label) {
      setDateRange({ from: '', to: '' })
    } else {
      const now = new Date()
      let fromDate
      const toDate = now

      switch (label) {
        case 'Last month':
          fromDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          break
        case 'Last quarter':
          fromDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          break
        case 'Last year':
          fromDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          break
        default:
          fromDate = toDate
          break
      }

      if (fromDate) {
        const formattedFrom = formatDate(fromDate)
        const formattedTo = formatDate(toDate)
        setDateRange({ from: formattedFrom, to: formattedTo })
      } else {
        setDateRange({ from: '', to: '' })
      }
    }
  }

  const handleDateInput = (value: string, type: string) => {
    let cleaned = value.replace(/[^0-9]/g, '')

    if (cleaned.length > 2) {
      cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
    }
    if (cleaned.length > 5) {
      cleaned = `${cleaned.slice(0, 5)}/${cleaned.slice(5)}`
    }

    const parts = cleaned.split('/')

    if (parts[0] && parseInt(parts[0], 10) > 31) {
      parts[0] = '31'
    }

    if (parts[1] && parseInt(parts[1], 10) > 12) {
      parts[1] = '12'
    }

    if (parts[2] && parts[2].length > 2) {
      parts[2] = parts[2].slice(0, 2)
    }

    cleaned = parts.join('/')

    setDateRange(prev => ({ ...prev, [type]: cleaned }))
  }

  const handleTransactionButtonPress = (label: string) => {
    setSelectedTransactionType(prev => (prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]))
  }
  const handleMerchantTypeButtonPress = (label: string) => {
    setSelectedMerchantType(prev => (prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]))
  }

  const handleOpenList = () => {
    setStep(prev => (prev === STEP.LIST ? STEP.FILTER : STEP.LIST))
  }

  const handleCloseFilterList = () => {
    setStep(STEP.FILTER)
  }

  function formatDateFilterToISO(obj: { from: string; to: string }) {
    if (!obj.from && !obj.to) return ''

    const isoFromDate = moment(obj.from, 'DD/MM/YY').startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS')
    const isoToDate = moment(obj.to, 'DD/MM/YY').endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS')

    return `${isoFromDate} - ${isoToDate}`
  }

  const handleCloseFilter = () => {
    Modal.close()
  }

  const handleApply = () => {
    const options: FilterOptionsType[] = []

    selectedItems.length &&
      selectedItems.forEach(asset => {
        options.push({ field: 'ASSET_TYPE', value: asset })
      })

    const dateString = formatDateFilterToISO(dateRange)
    dateString && options.push({ field: 'TIME', value: dateString })

    selectedTransactionType.length &&
      selectedTransactionType.forEach(name => {
        options.push({ field: 'TRANSACTION_TYPE', value: name })
      })

    selectedMerchantType.length &&
      selectedMerchantType.forEach(name => {
        options.push({ field: 'MERCHANT_TYPE', value: name })
      })

    setFilterOptions(options)
    handleCloseFilter()
  }

  const handleDeselectAll = () => {
    setFilterOptions([])
    setSelectedItems([])
    setSelectedDate('')
    setSelectedTransactionType([])
    setSelectedMerchantType([])
    setDateRange({ from: '', to: '' })
  }

  const getTransactionTypeButton = (type: string) => {
    if (type === TYPE_TXN_HISTORY.CRYPTO) {
      return [
        TITLE_TXN_HISTORY_NEW.DEPOSIT,
        TITLE_TXN_HISTORY_NEW.WITHDRAWAL,
        TITLE_TXN_HISTORY_NEW.EXCHANGE,
        TITLE_TXN_HISTORY_NEW.STAKE_ALLOCATION,
        TITLE_TXN_HISTORY_NEW.TOKEN_CLAIM,
        TITLE_TXN_HISTORY_NEW.REFUND_CLAIM,
        TITLE_TXN_HISTORY_NEW.STAKING_REWARD,
        TITLE_TXN_HISTORY_NEW.REFERRAL_BONUS,
      ]
    } else if (type === TYPE_TXN_HISTORY.FIAT) {
      return [TITLE_TXN_HISTORY_NEW.TOP_UP, TITLE_TXN_HISTORY_NEW.WITHDRAWAL]
    } else if (type === TYPE_TXN_HISTORY.CARD) {
      return ['Card Transaction', 'Top Up', 'Fee']
    } else if (type === TYPE_TXN_HISTORY.STAKING) {
      return ['Staking', 'Claiming', 'Staking Reward']
    } else if (type === TYPE_TXN_HISTORY.OTC) {
      return ['Trade Completed', 'Trade Cancelled', 'Awaiting Deposit', 'Offer Received']
    } else {
      return []
    }
  }

  const merchantTypeButtons = [
    'Groceries',
    'Shopping',
    'Restaurants',
    'Transport',
    'Travel',
    'Entertainment',
    'Health',
    'Services',
    'Utilities',
  ]

  return (
    <div className={styles.container}>
      <div className={styles.title}>Filters</div>

      {[TYPE_TXN_HISTORY.CRYPTO, TYPE_TXN_HISTORY.STAKING].includes(transactionType) && !filterAssetId ? (
        <div className={clsx(styles.section, step === STEP.LIST ? styles.fixSectionForSearchAndList : '')}>
          <div className={styles.sectionTitle}>Asset type</div>

          <div className={styles.horizontalLine}></div>

          <div className={styles.assetInputWrap} onClick={handleOpenList}>
            {selectedItems.length ? (
              <div className={styles.assetInputText}>{selectedItems.join(', ')}</div>
            ) : (
              <div className={styles.assetInputPlaceholder}>
                Choose an {transactionType === TYPE_TXN_HISTORY.CARD ? 'merchant' : 'asset'} type
              </div>
            )}
            <div className={clsx(styles.assetInputIcon, step === STEP.LIST ? styles.iconTransform : '')}>
              <TriangleIcon fill='var(--Deep-Space)' />
            </div>
          </div>
        </div>
      ) : null}

      {[TYPE_TXN_HISTORY.CARD].includes(transactionType) ? (
        <div className={clsx(styles.section, step === STEP.LIST ? styles.fixSectionForSearchAndList : '')}>
          <div className={styles.sectionTitle}>Merchant type</div>

          <div className={styles.horizontalLine}></div>

          <div className={styles.buttonGroupFilter}>
            {merchantTypeButtons.map(title => (
              <MiniButton
                key={title}
                title={title}
                action={() => handleMerchantTypeButtonPress(title)}
                buttonActive={selectedMerchantType.includes(title)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {[TYPE_TXN_HISTORY.OTC].includes(transactionType) && !filterAssetId ? (
        <div className={clsx(styles.section, step === STEP.LIST ? styles.fixSectionForSearchAndList : '')}>
          <div className={styles.sectionTitle}>Asset type</div>

          <div className={styles.horizontalLine}></div>

          <div className={styles.assetInputWrap} onClick={handleOpenList}>
            {selectedItems.length ? (
              <div className={styles.assetInputText}>{selectedItems.join(', ')}</div>
            ) : (
              <div className={styles.assetInputPlaceholder}>
                Choose an {transactionType === TYPE_TXN_HISTORY.CARD ? 'merchant' : 'asset'} type
              </div>
            )}
            <div className={clsx(styles.assetInputIcon, step === STEP.LIST ? styles.iconTransform : '')}>
              <TriangleIcon fill='var(--Deep-Space)' />
            </div>
          </div>
        </div>
      ) : null}

      {step === STEP.FILTER ? (
        <>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Date</div>

            <div className={styles.horizontalLine}></div>

            <div className={styles.buttonGroupFilter}>
              {['Last month', 'Last quarter', 'Last year'].map(title => (
                <MiniButton
                  key={title}
                  title={title}
                  action={() => handleDateButtonPress(title)}
                  buttonActive={selectedDate === title}
                />
              ))}
            </div>

            <div className={styles.inputDateGroup}>
              <div style={{ flexGrow: 1 }}>
                <div className={styles.inputDateLabel}>From</div>
                <input
                  type='text'
                  placeholder='dd/mm/year'
                  onChange={e => handleDateInput(e.target.value, 'from')}
                  value={dateRange.from}
                  className={styles.inputDate}
                  maxLength={8}
                />
              </div>
              <div style={{ flexGrow: 1 }}>
                <div className={styles.inputDateLabel}>To</div>
                <input
                  type='text'
                  placeholder='dd/mm/year'
                  onChange={e => handleDateInput(e.target.value, 'to')}
                  value={dateRange.to}
                  className={styles.inputDate}
                  maxLength={8}
                />
              </div>
            </div>
          </div>

          {transactionType !== TYPE_TXN_HISTORY.CASHBACK ? (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Transaction type</div>

              <div className={styles.horizontalLine}></div>

              <div className={styles.buttonGroupFilter}>
                {getTransactionTypeButton(transactionType).map(title => (
                  <MiniButton
                    key={title}
                    title={title}
                    action={() => handleTransactionButtonPress(title)}
                    buttonActive={selectedTransactionType.includes(title)}
                    // TODO: fo pairs stake ?
                    disabled={
                      title === TITLE_TXN_HISTORY_NEW.CASHBACK
                        ? !selectedItems.includes('FI') && !!selectedItems.length
                        : false
                    }
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className={styles.flexGrow1} />

          <div className={styles.mainBtnGroup}>
            <button className='btn-new primary grey height-56' onClick={handleDeselectAll}>
              Clear All
            </button>
            <button className='btn-new primary height-56' onClick={handleApply}>
              Apply
            </button>
          </div>
        </>
      ) : null}

      {step === STEP.LIST ? (
        <SearchAndList
          setSelectedItems={setSelectedItems}
          selectedItems={selectedItems}
          goBack={handleCloseFilterList}
        />
      ) : null}
    </div>
  )
}
