import React from 'react'

import checked from '../../assets/icons/checked.svg'
import styles from './styles.module.scss'

type Props = {
  value: string
}

export function CopiedBiz({ value }: Props) {
  return (
    <div className={styles.copiedBlock}>
      <div>{value} </div>
      <img className={styles.icon} src={checked} alt='' />
    </div>
  )
}
