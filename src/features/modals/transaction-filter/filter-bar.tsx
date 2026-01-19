import moment from 'moment'

import filterCloseIconSvg from 'assets/icons/history/filter-close-icon.svg'

import { FilterOptionsType } from '.'
import { NavButton } from './nav-button'
import styles from './styles.module.scss'

type Props = {
  filterOptions: FilterOptionsType[]
  handleCancelFilter: (value: string) => void
  isReport?: boolean
}

export const FilterBar = ({ filterOptions, handleCancelFilter, isReport }: Props) => {
  if (filterOptions.length === 0) {
    return null
  }

  const formatTimeRange = (timeRange: string) => {
    const [from, to] = timeRange.split(' - ')
    const formattedFrom = moment(from).format('MMMM D, YYYY')
    const formattedTo = moment(to).format('MMMM D, YYYY')
    return `${formattedFrom} - ${formattedTo}`
  }

  return (
    <div>
      <div className={styles.filterBar}>
        {isReport ? null : (
          <NavButton value={'Reset All'} action={() => handleCancelFilter('cancelAllFilter')} isActive={true} />
        )}

        {filterOptions.map((option, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index}>
            <NavButton
              value={option.field === 'TIME' ? formatTimeRange(option.value) : option.value}
              action={() => handleCancelFilter(option.value)}
              icon={isReport ? undefined : filterCloseIconSvg}
              iconLocation={isReport ? undefined : 'right'}
            />
          </div>
        ))}
      </div>
      <div style={{ height: 10 }} />
    </div>
  )
}
