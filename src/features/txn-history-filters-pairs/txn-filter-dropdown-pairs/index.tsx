import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import clsx from 'clsx'

import { TriangleIcon } from 'icons'

import { DropdownListPairs } from './dropdown-list-pairs'
import styles from './styles.module.scss'

type CustomSelectProps = {
  selectedItems: string[]
  setSelectedItems: Dispatch<SetStateAction<string[]>>
  placeholder: string
  options: string[]
}

export function TxnFilterDropdownPairs({ selectedItems, setSelectedItems, placeholder, options }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      if (!target.closest('#txnFilterDropdownBiz')) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <div className={styles.selectContainer} id='txnFilterDropdownBiz'>
      <div className={clsx(styles.selectDisplay, { [styles.open]: isOpen })} onClick={() => setIsOpen(!isOpen)}>
        {selectedItems?.length ? selectedItems.join(', ') : <p className={styles.placeholderText}>{placeholder}</p>}
        <div className={clsx(styles.assetInputIcon, { [styles.iconTransform]: isOpen })}>
          <TriangleIcon fill='var(--Deep-Space)' />
        </div>
      </div>

      {isOpen && (
        <DropdownListPairs selectedItems={selectedItems} setSelectedItems={setSelectedItems} options={options} />
      )}
    </div>
  )
}
