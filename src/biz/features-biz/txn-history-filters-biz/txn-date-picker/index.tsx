import { Dispatch, SetStateAction } from 'react'
import moment from 'moment/moment'

import 'rsuite/dist/rsuite.min.css'
import styles from './styles.module.scss'
import { DateRangePicker } from 'rsuite'

type CustomSelectProps = {
  selectedItems: string[]
  setSelectedItems: Dispatch<SetStateAction<string[]>>
}

export function TxnDatePicker({ selectedItems, setSelectedItems }: CustomSelectProps) {
  const handleDatePicker = (dataItem: any) => {
    if (dataItem == null) {
      setSelectedItems([])
    }

    const startDate = moment(dataItem?.[0]).format('DD/MM/YY')
    const endDate = moment(dataItem?.[1]).format('DD/MM/YY')
    const formatedDate = dataItem ? `${startDate} - ${endDate}` : ''

    if (isNaN(new Date(dataItem?.[0]).getTime())) return
    if (isNaN(new Date(dataItem?.[1]).getTime())) return

    setSelectedItems(prevSelectedItems => {
      if (prevSelectedItems.includes(formatedDate)) {
        return prevSelectedItems.filter(prevItem => prevItem !== formatedDate)
      } else {
        return formatedDate ? [...prevSelectedItems, formatedDate] : []
      }
    })
  }

  return (
    <div className={styles.selectContainer}>
      <div className={styles.selectDisplay}>
        <DateRangePicker
          // showOneCalendar
          size='lg'
          block
          showHeader={false}
          style={{ width: '100%' }}
          format={'dd/MM/yyyy'}
          onChange={handleDatePicker}
        />
      </div>
    </div>
  )
}
