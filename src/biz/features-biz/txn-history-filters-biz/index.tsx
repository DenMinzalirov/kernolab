import { Dispatch, ReactElement, SetStateAction, useState } from 'react'
import { useUnit } from 'effector-react'

import { Modal } from 'components'
import { $assetEurData, $assetsListData, $assetUsdData } from 'model/cefi-combain-assets-data'

import { DateSelectionModalBiz } from '../modals-biz/date-selection-modal-biz'
import { TxnHistoryFilterMobileBiz } from '../modals-biz/txn-history-filter-mobile-biz'
import { FilterDataType } from '../txn-history-biz'
import styles from './styles.module.scss'
import { TxnDatePicker } from './txn-date-picker'
import { TxnFilterDropdownBiz } from './txn-filter-dropdown-biz'

type Props = {
  filtersData: FilterDataType
  setFiltersData: Dispatch<SetStateAction<FilterDataType>>
}

const FILD_TYPE_OPTIONS = ['Send Fiat', 'Receive Fiat', 'Send Crypto', 'Receive Crypto', 'Exchange']

export function TxnHistoryFiltersBiz({ filtersData, setFiltersData }: Props) {
  const assetEurData = useUnit($assetEurData)
  const assetUsdData = useUnit($assetUsdData)
  const assetsListData = useUnit($assetsListData)
  const assetIds = assetsListData.map(asset => asset.assetId)
  const assets = useUnit($assetsListData)

  const updateFilterOption = (key: keyof typeof filtersData, items: SetStateAction<string[]>) => {
    setFiltersData(prev => ({
      ...prev,
      [key]: typeof items === 'function' ? items(prev[key]) : items,
    }))
  }

  const openFilterType = () => {
    const itemComponent = (item: string) => {
      return <div className={styles.filterTypeText}>{item}</div>
    }

    Modal.open(
      <TxnHistoryFilterMobileBiz
        title='Select a Transaction Type'
        data={FILD_TYPE_OPTIONS}
        selectedItems={filtersData.type}
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

    Modal.open(
      <TxnHistoryFilterMobileBiz
        title='Select an Asset'
        data={[...assetIds, 'EUR' /* , 'USD' */]}
        selectedItems={filtersData.asset}
        submit={items => updateFilterOption('asset', items)}
        itemComponent={itemComponent}
      />,
      {
        variant: 'down-mobile',
      }
    )
  }
  const openFilterDate = () => {
    Modal.open(<DateSelectionModalBiz submit={items => updateFilterOption('date', items)} />, {
      variant: 'down-mobile',
      className: styles.modalFix,
    })
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.filterSelectWrap}>
          <label className={styles.filterSelectLabel}>Date</label>
          <TxnDatePicker
            selectedItems={filtersData.date}
            setSelectedItems={items => updateFilterOption('date', items)}
          />
        </div>
        <div className={styles.filterSelectWrap}>
          <label className={styles.filterSelectLabel}>Asset</label>
          <TxnFilterDropdownBiz
            placeholder='All'
            options={[...assetIds, 'EUR']}
            selectedItems={filtersData.asset}
            setSelectedItems={items => updateFilterOption('asset', items)}
          />
        </div>
        <div className={styles.filterSelectWrap}>
          <label className={styles.filterSelectLabel}>Transaction Type</label>
          <TxnFilterDropdownBiz
            placeholder='All'
            options={FILD_TYPE_OPTIONS}
            selectedItems={filtersData.type}
            setSelectedItems={items => updateFilterOption('type', items)}
          />
        </div>
      </div>

      <div className={styles.containerMd}>
        <div className={styles.activeFilterRow}>
          {filtersData.type.map(item => {
            return (
              <button
                onClick={() => {
                  const newItems = filtersData.type.filter(type => type !== item)
                  updateFilterOption('type', newItems)
                }}
                className='btn-with-icon-biz light-blue'
                key={item}
              >
                {item}
                <div className={styles.iconContainer}>
                  <div className={styles.iconCircle}></div>
                </div>
              </button>
            )
          })}

          {filtersData.asset.map(item => {
            return (
              <button
                onClick={() => {
                  const newItems = filtersData.asset.filter(asset => asset !== item)
                  updateFilterOption('asset', newItems)
                }}
                className='btn-with-icon-biz light-blue'
                key={item}
              >
                {item}
                <div className={styles.iconContainer}>
                  <div className={styles.iconCircle}></div>
                </div>
              </button>
            )
          })}

          {filtersData.date.map(item => {
            return (
              <button
                onClick={() => {
                  const newItems = filtersData.date.filter(date => date !== item)
                  updateFilterOption('date', newItems)
                }}
                className='btn-with-icon-biz light-blue'
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

        <button onClick={openFilterDate} className='btn-with-icon-biz transparent-with-border-blue'>
          Date
        </button>
        <button onClick={openFilterAsset} className='btn-with-icon-biz transparent-with-border-blue'>
          Asset
        </button>
        <button onClick={openFilterType} className='btn-with-icon-biz transparent-with-border-blue'>
          Transaction Type
        </button>
      </div>
    </>
  )
}
