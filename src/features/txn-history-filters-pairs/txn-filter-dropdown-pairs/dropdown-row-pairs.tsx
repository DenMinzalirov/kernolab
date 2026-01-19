import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { DropdownCheckbox } from 'components/dropdown-checkbox'
import { $assetEurData, $assetsListData, $assetUsdData } from 'model/cefi-combain-assets-data'

import styles from './styles.module.scss'

type ListRowType = {
  assetId: string
  selected: boolean
  onPress: () => void
}
export const DropdownRowPairs = ({ assetId, selected, onPress }: ListRowType) => {
  const assets = useUnit($assetsListData)
  const assetEurData = useUnit($assetEurData)
  const assetUsdData = useUnit($assetUsdData)
  const asset = [...assets, assetEurData].find(assetItem => assetItem.assetId === assetId)

  return (
    <div onClick={onPress} className={styles.listRow}>
      <div className={styles.listRowTitleWrap}>
        {asset?.icon ? (
          <img className={clsx(styles.listRowSelectIcon, 'asset-icon')} alt='icon' src={asset?.icon || ''} />
        ) : null}
        <div>
          <div className={styles.listRowSelectTitle}>{assetId}</div>
        </div>
      </div>
      <DropdownCheckbox checked={selected} />
    </div>
  )
}
