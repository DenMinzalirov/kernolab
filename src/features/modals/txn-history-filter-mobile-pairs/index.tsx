import React, { ReactElement } from 'react'

import { Modal } from 'components'
import { DropdownCheckbox } from 'components/dropdown-checkbox'

import styles from './styles.module.scss'

type Props = {
  title: string
  data: Array<any>
  selectedItems: Array<any>
  submit: (arg0: any) => void
  itemComponent: (arg0: any) => ReactElement
}

export function TxnHistoryFilterMobilePairs({
  title,
  data,
  selectedItems,
  submit,
  itemComponent,
}: Props): React.ReactNode {
  const [selectedData, setSelectedData] = React.useState<string[]>(selectedItems || [])

  const handleSelectValue = (value: string) => {
    setSelectedData(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value)
      }

      return [...prev, value]
    })
  }

  const handleSubmit = () => {
    submit(selectedData)
    Modal.close()
  }

  return (
    <div className={styles.containerModal}>
      <div className={styles.contentWrapModal}>
        <div className={styles.title}>{title}</div>
        <div className={styles.assetsContainer}>
          {data.map(item => {
            return (
              <div onClick={() => handleSelectValue(item)} className={styles.row} key={item}>
                {itemComponent(item)}
                <DropdownCheckbox checked={selectedData.includes(item)} />
              </div>
            )
          })}
        </div>

        <button onClick={handleSubmit} className='btn-new primary height-60 big'>
          Apply
        </button>
      </div>
    </div>
  )
}
