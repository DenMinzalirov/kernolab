import React from 'react'
import { useUnit } from 'effector-react'

import { DropdownCheckbox } from 'components/dropdown-checkbox'

import { $assetEurData, $assetsListData } from '../../../model/cefi-combain-assets-data'
import styles from './styles.module.scss'

type ListRowType = {
  assetId: string
  selected: boolean
  onPress: () => void
}
const ListRow = ({ assetId, selected, onPress }: ListRowType) => {
  const assets = useUnit($assetsListData)
  const assetEurData = useUnit($assetEurData)
  const asset = [...assets, assetEurData].find(assetItem => assetItem.assetId === assetId)

  return (
    <div onClick={onPress} className={styles.listRowSelect}>
      <div className={styles.listRowSelectTitleWrap}>
        <img className={styles.listRowSelectIcon} alt='icon' src={asset?.icon || ''} />
        <div>
          <div className={styles.listRowSelectTitle}>{assetId}</div>
        </div>
      </div>
      <DropdownCheckbox checked={selected} />
    </div>
  )
}

type Props = {
  selectedItems: string[]
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>
}

export const FilterList = ({ selectedItems, setSelectedItems }: Props) => {
  const assetsListData = useUnit($assetsListData)
  const assetIds = assetsListData.map(asset => asset.assetId)

  const handleRowPress = (item: string) => {
    setSelectedItems(prevSelectedItems => {
      if (prevSelectedItems.includes(item)) {
        return prevSelectedItems.filter(prevItem => prevItem !== item)
      } else {
        return [...prevSelectedItems, item]
      }
    })
  }

  return (
    <div className={styles.filterListWrap}>
      {[...assetIds, 'EUR'].map(assetId => (
        <ListRow
          key={assetId}
          assetId={assetId}
          selected={selectedItems.includes(assetId)}
          onPress={() => handleRowPress(assetId)}
        />
      ))}
    </div>
  )
}
