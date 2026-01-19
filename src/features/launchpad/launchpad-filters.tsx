import React, { Dispatch, SetStateAction } from 'react'

import { MiniButton } from 'components/mini-button'

import styles from './styles.module.scss'

type Props = {
  setStatusFilter: Dispatch<SetStateAction<string>>
  statusFilter: string
  list: string[]
}

export function LaunchpadFilters({ statusFilter, setStatusFilter, list }: Props) {
  return (
    <div className={styles.buttonGroupFilter}>
      {list.map(title => {
        return (
          <MiniButton
            key={title}
            title={title}
            action={() => setStatusFilter(title)}
            buttonActive={statusFilter === title}
            size='small'
          />
        )
      })}
    </div>
  )
}
