import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { is } from 'effector'
import { useUnit } from 'effector-react'
import moment from 'moment'

import { Modal } from 'components'
import { DateSelectionModalPairs } from 'features/modals/date-selection-modal-pairs'
import { FilterOptionsType } from 'features/modals/transaction-filter'
import { TxnHistoryFilterMobilePairs } from 'features/modals/txn-history-filter-mobile-pairs'
import { TYPE_TXN_HISTORY } from 'features/transactions-history/constants'
import { $assetEurData, $assetsListData, $assetUsdData } from 'model/cefi-combain-assets-data'

import styles from './styles.module.scss'
import { TxnDatePicker } from './txn-date-picker'
import { TxnFilterDropdownPairs } from './txn-filter-dropdown-pairs'

type FilterDataType = {
  date: string[]
  asset: string[]
  type: string[]
}

export type TxnFiltersState = {
  filterOptions: FilterOptionsType[]
  filtersData: FilterDataType
}

export type FilterOptionsPairsType = {
  field: string
  value: string
}

const fieldMapping: Record<string, string> = {
  asset: 'ASSET_TYPE',
  date: 'TIME',
  type: 'TRANSACTION_TYPE',
  status: 'STATUS',
}

function transformFilterOptionsPairs(filterOptions: FilterDataType): FilterOptionsPairsType[] {
  const result: FilterOptionsPairsType[] = []

  for (const [key, values] of Object.entries(filterOptions)) {
    const field = fieldMapping[key]

    if (field) {
      values.forEach(value => {
        let transformedValue = value

        if (key === 'date') {
          const dateParts = value.split(' - ').map(part => moment(part, 'DD/MM/YYYY').format('YYYY-MM-DD'))
          transformedValue = dateParts.join(' - ')
        }

        result.push({ field, value: transformedValue })
      })
    }
  }

  return result
}

type Props = {
  txnFilters: TxnFiltersState
  setTxnFilters: Dispatch<SetStateAction<TxnFiltersState>>
  transactionType: string
}

const FILD_TYPE_OPTIONS_FOR_CRYPTO = [
  'Deposit',
  'Withdrawal',
  'Exchange',
  'Earning Reward',
  'Campaign Reward',
  'Referral Bonus',
  'Refund',
  'Refund Claim',
  'Stake Allocation',
  'Token Claim',
]
const FILD_TYPE_OPTIONS_FOR_FIAT = ['Top Up', 'Withdrawal']
const FILD_TYPE_OPTIONS_FOR_CARD = ['Card Transaction', 'Top Up', 'Fee']
const FILD_TYPE_OPTIONS_FOR_STAKING = [
  'Supercharge Staked',
  'Supercharge Claimed',
  'FI Staked',
  'FI Claimed',
  'Fideum Earn Staked',
  'Fideum Earn Claimed',
  'Staking Reward',
]

const MERCHANT_TYPE_VALUES = [
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

export function TxnHistoryFiltersPairs({ transactionType, txnFilters, setTxnFilters }: Props) {
  const assetEurData = useUnit($assetEurData)
  const assetUsdData = useUnit($assetUsdData)
  const assetsListData = useUnit($assetsListData)
  const assetIds = assetsListData.map(asset => asset.assetId)
  const assets = useUnit($assetsListData)
  const isCard = transactionType === TYPE_TXN_HISTORY.CARD

  const getTypeList = (txnType: string) => {
    if (txnType === TYPE_TXN_HISTORY.CRYPTO) {
      return FILD_TYPE_OPTIONS_FOR_CRYPTO
    } else if (txnType === TYPE_TXN_HISTORY.FIAT) {
      return FILD_TYPE_OPTIONS_FOR_FIAT
    } else if (txnType === TYPE_TXN_HISTORY.STAKING) {
      return FILD_TYPE_OPTIONS_FOR_STAKING
    } else if (txnType === TYPE_TXN_HISTORY.CARD) {
      return FILD_TYPE_OPTIONS_FOR_CARD
    }
    return []
  }

  const typeList = getTypeList(transactionType)

  const updateFilterOption = (key: keyof typeof txnFilters.filtersData, items: SetStateAction<string[]>) => {
    setTxnFilters(prev => {
      const updatedFiltersData = {
        ...prev.filtersData,
        [key]: typeof items === 'function' ? items(prev.filtersData[key]) : items,
      }

      return {
        ...prev,
        filtersData: updatedFiltersData,
        filterOptions: transformFilterOptionsPairs(updatedFiltersData),
      }
    })
  }

  const openFilterType = () => {
    const itemComponent = (item: string) => {
      return <div className={styles.filterTypeText}>{item}</div>
    }

    Modal.open(
      <TxnHistoryFilterMobilePairs
        title='Type'
        data={typeList}
        selectedItems={txnFilters.filtersData.type}
        submit={items => updateFilterOption('type', items)}
        itemComponent={itemComponent}
      />,
      {
        variant: 'down-mobile',
      }
    )
  }
  const openFilterAsset = () => {
    const itemComponent = (item: string) => {
      const asset = [...assets, assetEurData].find(assetItem => assetItem.assetId === item)

      return (
        <div className={styles.filterAssetRow}>
          <img alt={''} src={asset?.icon} className={styles.filterAssetIcon} />
          <div className={styles.filterAssetIdText}>{asset?.assetId}</div>
          {' - '}
          <div className={styles.filterAssetNameText}>{asset?.assetName}</div>
        </div>
      )
    }

    const itemComponentForCard = (item: string) => {
      return <div className={styles.filterTypeText}>{item}</div>
    }

    Modal.open(
      <TxnHistoryFilterMobilePairs
        title={isCard ? 'Category' : 'Asset'}
        data={isCard ? MERCHANT_TYPE_VALUES : [...assetIds, 'EUR' /* , 'USD' */]}
        selectedItems={txnFilters.filtersData.asset}
        submit={items => updateFilterOption('asset', items)}
        itemComponent={isCard ? itemComponentForCard : itemComponent}
      />,
      {
        variant: 'down-mobile',
      }
    )
  }
  const openFilterDate = () => {
    Modal.open(<DateSelectionModalPairs submit={items => updateFilterOption('date', items)} />, {
      variant: 'down-mobile',
      className: styles.modalFix,
    })
  }

  return (
    <>
      {/* desktop */}
      <div className={styles.container}>
        <div className={styles.filterSelectWrap}>
          <label className={styles.filterSelectLabel}>Date</label>
          <TxnDatePicker
            selectedItems={txnFilters.filtersData.date}
            setSelectedItems={items => updateFilterOption('date', items)}
          />
        </div>
        <div className={styles.filterSelectWrap}>
          <label className={styles.filterSelectLabel}>Type</label>
          <TxnFilterDropdownPairs
            placeholder='Choose from the list'
            options={typeList}
            selectedItems={txnFilters.filtersData.type}
            setSelectedItems={items => updateFilterOption('type', items)}
          />
        </div>
        <div className={styles.filterSelectWrap}>
          <label className={styles.filterSelectLabel}>{isCard ? 'Category' : 'Asset'}</label>
          <TxnFilterDropdownPairs
            placeholder='Choose from the list'
            options={isCard ? MERCHANT_TYPE_VALUES : [...assetIds, 'EUR']}
            selectedItems={txnFilters.filtersData.asset}
            setSelectedItems={items => updateFilterOption('asset', items)}
          />
        </div>
      </div>

      {/* mobile */}
      <div className={styles.containerMd}>
        {txnFilters.filtersData.type.length ||
        txnFilters.filtersData.asset.length ||
        txnFilters.filtersData.date.length ? (
          <div className={styles.activeFilterRow}>
            {txnFilters.filtersData.type.map(item => {
              return (
                <button
                  onClick={() => {
                    const newItems = txnFilters.filtersData.type.filter(type => type !== item)
                    updateFilterOption('type', newItems)
                  }}
                  className='btn-with-icon-pairs black'
                  key={item}
                >
                  {item}
                  <div className={styles.iconContainer}>
                    <div className={styles.iconCircle}></div>
                  </div>
                </button>
              )
            })}

            {txnFilters.filtersData.asset.map(item => {
              return (
                <button
                  onClick={() => {
                    const newItems = txnFilters.filtersData.asset.filter(asset => asset !== item)
                    updateFilterOption('asset', newItems)
                  }}
                  className='btn-with-icon-pairs black'
                  key={item}
                >
                  {item}
                  <div className={styles.iconContainer}>
                    <div className={styles.iconCircle}></div>
                  </div>
                </button>
              )
            })}

            {txnFilters.filtersData.date.map(item => {
              return (
                <button
                  onClick={() => {
                    const newItems = txnFilters.filtersData.date.filter(date => date !== item)
                    updateFilterOption('date', newItems)
                  }}
                  className='btn-with-icon-pairs black'
                  key={item}
                >
                  {item}
                  <div className={styles.iconContainer}>
                    <div className={styles.iconCircle}></div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : null}

        <button onClick={openFilterDate} className='btn-with-icon-pairs primary'>
          Date
        </button>
        <button onClick={openFilterAsset} className='btn-with-icon-pairs primary'>
          {isCard ? 'Category' : 'Asset'}
        </button>
        <button onClick={openFilterType} className='btn-with-icon-pairs primary'>
          Transaction Type
        </button>
      </div>
    </>
  )
}
