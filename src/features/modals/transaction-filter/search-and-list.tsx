import clsx from 'clsx'

import { FilterList } from './filter-list'
import styles from './styles.module.scss'

type Props = {
  goBack: () => void
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>
  selectedItems: string[]
}

export const SearchAndList = ({ goBack, setSelectedItems, selectedItems }: Props) => {
  const handleDeselectAll = () => {
    setSelectedItems([])
  }

  const handleApply = () => {
    goBack()
  }

  return (
    <>
      <FilterList selectedItems={selectedItems} setSelectedItems={setSelectedItems} />

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
  )
}
