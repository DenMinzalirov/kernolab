import { DropdownRowBiz } from './dropdown-row-biz'
import styles from './styles.module.scss'

type Props = {
  selectedItems: string[]
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>
  options?: string[]
}

export const DropdownListBiz = ({ selectedItems, setSelectedItems, options = [] }: Props) => {
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
    <div className={styles.listWrap}>
      {options.map(assetId => (
        <DropdownRowBiz
          key={assetId}
          assetId={assetId}
          selected={selectedItems.includes(assetId)}
          onPress={() => handleRowPress(assetId)}
        />
      ))}
    </div>
  )
}
