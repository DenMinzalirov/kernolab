import moment from 'moment'

import { Modal } from 'components'

import styles from './styles.module.scss'
import { DateRangePicker } from 'rsuite'
import { RangeType } from 'rsuite/esm/DateRangePicker'
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subDays,
} from 'rsuite/esm/internals/utils/date'

const predefinedRanges: RangeType[] = [
  {
    label: 'Today',
    value: [new Date(), new Date()],
    placement: 'left',
  },
  {
    label: 'Yesterday',
    value: [addDays(new Date(), -1), addDays(new Date(), -1)],
    placement: 'left',
  },
  {
    label: 'This week',
    value: [startOfWeek(new Date()), endOfWeek(new Date())],
    placement: 'left',
  },
  {
    label: 'Last 7 days',
    value: [subDays(new Date(), 6), new Date()],
    placement: 'left',
  },
  {
    label: 'Last 30 days',
    value: [subDays(new Date(), 29), new Date()],
    placement: 'left',
  },
  {
    label: 'This month',
    value: [startOfMonth(new Date()), new Date()],
    placement: 'left',
  },
  {
    label: 'Last month',
    value: [startOfMonth(addMonths(new Date(), -1)), endOfMonth(addMonths(new Date(), -1))],
    placement: 'left',
  },
  {
    label: 'This year',
    value: [new Date(new Date().getFullYear(), 0, 1), new Date()],
    placement: 'left',
  },
  {
    label: 'Last year',
    value: [new Date(new Date().getFullYear() - 1, 0, 1), new Date(new Date().getFullYear(), 0, 0)],
    placement: 'left',
  },
  {
    label: 'All time',
    value: [new Date(new Date().getFullYear() - 1, 0, 1), new Date()],
    placement: 'left',
  },
]

type Props = {
  submit: (arg0: any) => void
}

export const DateSelectionModalPairs = ({ submit }: Props) => {
  const handleDatePicker = (dataItem: any) => {
    if (dataItem == null) {
      submit([])
    }

    const startDate = moment(dataItem?.[0]).format('DD/MM/YY')
    const endDate = moment(dataItem?.[1]).format('DD/MM/YY')
    const formatedDate = dataItem ? `${startDate} - ${endDate}` : ''

    if (isNaN(new Date(dataItem?.[0]).getTime())) return
    if (isNaN(new Date(dataItem?.[1]).getTime())) return

    submit([formatedDate])
    Modal.close()
  }

  return (
    <div className={styles.containerModal}>
      <div className={styles.contentWrapModal}>
        <div className={styles.title} style={{ paddingLeft: 15 }}>
          Select a start date
        </div>
        <div style={{ flexGrow: 1 }}></div>

        <DateRangePicker
          ranges={predefinedRanges}
          showOneCalendar
          placeholder='One calendar'
          placement='auto'
          open={true}
          onChange={handleDatePicker}
          style={{ visibility: 'hidden', width: 0, height: 0 }}
        />
      </div>
    </div>
  )
}
